#!/usr/bin/env python3
"""Create or repair a repo-root CLAUDE.md -> AGENTS.md symlink."""

from __future__ import annotations

import argparse
import os
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

CLAUDE_CANDIDATES = ("CLAUDE.md", "claude.md")
AGENTS_CANDIDATES = ("AGENTS.md", "agents.md")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Ensure the repo-root Claude file is a symlink to the repo-root AGENTS file."
    )
    parser.add_argument(
        "--root",
        default=".",
        help="Project root to modify. Defaults to the current working directory.",
    )
    parser.add_argument(
        "--claude-name",
        help="Explicit Claude-side file name, for example CLAUDE.md or claude.md.",
    )
    parser.add_argument(
        "--agents-name",
        help="Explicit AGENTS-side file name, for example AGENTS.md or agents.md.",
    )
    parser.add_argument(
        "--replace-existing",
        action="store_true",
        help="Replace an existing non-symlink Claude file or a symlink pointing elsewhere.",
    )
    parser.add_argument(
        "--no-backup",
        action="store_true",
        help="Do not create a timestamped backup when replacing an existing Claude file.",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Print the planned action without changing files.",
    )
    return parser.parse_args()


def find_candidates(root: Path, names: tuple[str, ...]) -> list[Path]:
    return [root / name for name in names if (root / name).exists() or (root / name).is_symlink()]


def choose_existing(root: Path, explicit_name: str | None, default_names: tuple[str, ...], role: str) -> Path | None:
    if explicit_name:
        path = root / explicit_name
        if path.exists() or path.is_symlink():
            return path
        return None

    matches = find_candidates(root, default_names)
    if len(matches) > 1:
        names = ", ".join(path.name for path in matches)
        raise SystemExit(f"[ERROR] Found multiple {role} candidates in {root}: {names}. Choose one explicitly.")
    return matches[0] if matches else None


def choose_new_claude_path(root: Path, explicit_name: str | None, agents_path: Path) -> Path:
    if explicit_name:
        return root / explicit_name
    if agents_path.name.islower():
        return root / "claude.md"
    return root / "CLAUDE.md"


def describe_path(path: Path) -> str:
    if path.is_symlink():
        return f"symlink -> {os.readlink(path)}"
    if path.exists():
        return "regular file"
    return "missing"


def is_same_target(link_path: Path, target_path: Path) -> bool:
    if not link_path.is_symlink():
        return False
    raw_target = os.readlink(link_path)
    resolved = (link_path.parent / raw_target).resolve()
    return resolved == target_path.resolve()


def backup_path(path: Path) -> Path:
    timestamp = datetime.now().strftime("%Y%m%d-%H%M%S")
    return path.with_name(f"{path.name}.bak.{timestamp}")


def move_to_backup(path: Path) -> Path:
    destination = backup_path(path)
    shutil.move(str(path), str(destination))
    return destination


def remove_path(path: Path) -> None:
    if path.is_symlink() or path.is_file():
        path.unlink()
        return
    if path.is_dir():
        raise SystemExit(f"[ERROR] Refusing to replace directory: {path}")


def run_windows_fallbacks(link_path: Path, relative_target: str) -> None:
    commands = [
        [
            "powershell",
            "-NoProfile",
            "-Command",
            f"New-Item -ItemType SymbolicLink -Path '{link_path.name}' -Target '{relative_target}' | Out-Null",
        ],
        ["cmd", "/c", "mklink", link_path.name, relative_target],
    ]
    last_error: Exception | None = None
    for command in commands:
        try:
            subprocess.run(
                command,
                cwd=link_path.parent,
                check=True,
                capture_output=True,
                text=True,
            )
            return
        except (OSError, subprocess.CalledProcessError) as exc:
            last_error = exc
    raise RuntimeError(
        "Windows symlink creation failed. Enable Developer Mode or run an elevated shell, then retry."
    ) from last_error


def create_symlink(link_path: Path, target_path: Path) -> None:
    relative_target = os.path.relpath(target_path, start=link_path.parent)
    try:
        os.symlink(relative_target, link_path)
    except OSError as exc:
        if os.name == "nt":
            run_windows_fallbacks(link_path, relative_target)
            return
        raise RuntimeError(f"Unable to create symlink {link_path} -> {relative_target}: {exc}") from exc


def main() -> int:
    args = parse_args()
    root = Path(args.root).expanduser().resolve()
    if not root.exists():
        raise SystemExit(f"[ERROR] Root path does not exist: {root}")

    agents_path = choose_existing(root, args.agents_name, AGENTS_CANDIDATES, "AGENTS")
    if agents_path is None:
        raise SystemExit(
            "[ERROR] Could not find AGENTS.md or agents.md in the project root. Create the target file first."
        )

    existing_claude = choose_existing(root, args.claude_name, CLAUDE_CANDIDATES, "Claude")
    claude_path = existing_claude or choose_new_claude_path(root, args.claude_name, agents_path)

    print(f"[INFO] Root: {root}")
    print(f"[INFO] Target AGENTS file: {agents_path.name}")
    print(f"[INFO] Claude-side path: {claude_path.name}")

    if claude_path.exists() or claude_path.is_symlink():
        print(f"[INFO] Existing Claude path type: {describe_path(claude_path)}")
        if is_same_target(claude_path, agents_path):
            print(f"[OK] Already linked: {claude_path.name} -> {os.readlink(claude_path)}")
            return 0

        if not args.replace_existing:
            raise SystemExit(
                f"[ERROR] {claude_path.name} already exists and does not point to {agents_path.name}. "
                "Re-run with --replace-existing after reviewing the file."
            )

        if args.dry_run:
            print(f"[DRY-RUN] Would replace {claude_path.name} with a symlink to {agents_path.name}.")
            return 0

        if args.no_backup:
            remove_path(claude_path)
            print(f"[OK] Removed existing {claude_path.name} without backup.")
        else:
            backup = move_to_backup(claude_path)
            print(f"[OK] Backed up existing {claude_path.name} to {backup.name}.")
    elif args.dry_run:
        print(f"[DRY-RUN] Would create {claude_path.name} -> {agents_path.name}.")
        return 0

    if not args.dry_run:
        create_symlink(claude_path, agents_path)
        print(f"[OK] Created symlink: {claude_path.name} -> {os.readlink(claude_path)}")

    if not is_same_target(claude_path, agents_path):
        raise SystemExit(f"[ERROR] Verification failed: {claude_path.name} does not resolve to {agents_path.name}.")

    print(f"[OK] Verified {claude_path.name} resolves to {agents_path.name}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
