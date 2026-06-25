#!/usr/bin/env python3
"""
sync-skills.py

将 git submodule 中的 skill/插件 目录同步（复制）到本仓库对应目录下，
替代之前的 symlink 方案——symlink 在其他机器 clone 后无法解析。

用法：
  python .claude/skills/sync-skills/scripts/sync-skills.py            # 同步所有
  python .claude/skills/sync-skills/scripts/sync-skills.py --dry-run  # 仅打印将要执行的操作
  python .claude/skills/sync-skills/scripts/sync-skills.py --clean    # 先删除目标再复制（强制覆盖）
  python .claude/skills/sync-skills/scripts/sync-skills.py --add SOURCE TARGET [--optional]  # 添加新映射
  python .claude/skills/sync-skills/scripts/sync-skills.py --add-plugin PLUGIN_NAME          # 添加整个插件映射
  python .claude/skills/sync-skills/scripts/sync-skills.py --check-upstream [--quiet]        # 检查 submodule 是否落后 upstream
  python .claude/skills/sync-skills/scripts/sync-skills.py --pull-upstream                   # 把 submodule 拉到 upstream HEAD
  python .claude/skills/sync-skills/scripts/sync-skills.py --update                          # pull-upstream + sync

映射关系从同目录下的 skill-map.json 读取；若文件不存在，从 skill-map.default.json 初始化。
支持通过 --add 命令自动追加新映射，通过 --add-plugin 添加整个插件映射。
"""

import os
import sys
import json
import shutil
import argparse
import subprocess
from pathlib import Path

# 定位仓库根目录（脚本在 .claude/skills/sync-skills/scripts/ 下，向上 4 级）
SCRIPT_DIR = Path(__file__).resolve().parent
SKILL_DIR = SCRIPT_DIR.parent
ROOT = SKILL_DIR.parent.parent.parent
MAP_FILE = SCRIPT_DIR / "skill-map.json"
DEFAULT_MAP_FILE = SCRIPT_DIR / "skill-map.default.json"


# ─── 映射表读写 ───────────────────────────────────────────────────────────────

def load_map() -> list[dict]:
    """从 skill-map.json 加载映射表；不存在则从 .default.json 初始化"""
    if MAP_FILE.exists():
        with open(MAP_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    if DEFAULT_MAP_FILE.exists():
        with open(DEFAULT_MAP_FILE, "r", encoding="utf-8") as f:
            default = json.load(f)
        save_map(default)
        print(f"  ℹ️  已从 {DEFAULT_MAP_FILE.name} 初始化 {MAP_FILE.name}")
        return default
    print("❌ skill-map.json 和 skill-map.default.json 均不存在")
    sys.exit(1)


def save_map(entries: list[dict]):
    """将映射表写回 skill-map.json"""
    MAP_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(MAP_FILE, "w", encoding="utf-8") as f:
        json.dump(entries, f, indent=2, ensure_ascii=False)
    print(f"  💾 映射表已保存: {MAP_FILE.relative_to(ROOT)}")


# ─── 添加条目 ─────────────────────────────────────────────────────────────────

def add_entry(source: str, target: str, optional: bool = False):
    """向映射表追加一条新记录（去重）"""
    entries = load_map()

    # 规范化路径分隔符
    source = source.replace("\\", "/").strip("/")
    target = target.replace("\\", "/").strip("/")

    # 检查重复
    for e in entries:
        if e["source"] == source and e["target"] == target:
            print(f"  ⚠️  已存在相同映射，跳过: {source} → {target}")
            return

    new_entry = {"source": source, "target": target}
    if optional:
        new_entry["optional"] = True

    entries.append(new_entry)
    save_map(entries)
    print(f"  ✅ 已添加: {source} → {target}" + (" [可选]" if optional else ""))


def add_plugin_entry(plugin_name: str, optional: bool = False):
    """添加整个插件的映射，替换该 target 下已有的散装条目"""
    source = f"claude-plugins-official/plugins/{plugin_name}"
    target = plugin_name

    entries = load_map()

    # 移除该 target 下的旧映射（散装条目）
    removed = [e for e in entries if e["target"].startswith(target + "/") or e["target"] == target]
    for e in removed:
        entries.remove(e)
    if removed:
        print(f"  🧹 已移除 {len(removed)} 条旧映射: {target}/")

    # 检查是否已存在完全相同的映射
    for e in entries:
        if e["source"] == source and e["target"] == target:
            print(f"  ⚠️  已存在相同映射，跳过: {source} → {target}")
            return

    new_entry = {"source": source, "target": target}
    if optional:
        new_entry["optional"] = True

    entries.append(new_entry)
    save_map(entries)
    print(f"  ✅ 已添加插件: {source} → {target}" + (" [可选]" if optional else ""))

    # 提示 .gitignore
    print(f"\n  💡 建议在 .gitignore 中添加:")
    print(f"     # {plugin_name}: from claude-plugins-official")
    print(f"     {target}/")


# ─── 同步逻辑 ─────────────────────────────────────────────────────────────────

# 插件级映射中不会从 upstream 覆盖的文件——避免本仓库自有版本号、配置被刷掉。
# 路径相对插件目录根。
PLUGIN_LEVEL_IGNORES = {
    ".claude-plugin/plugin.json",  # 版本号本仓库说了算（详见 SKILL.md「版本与内容分治原则」）
    ".codex-plugin/plugin.json",
    "SKILL.md",
}

SKILL_LEVEL_IGNORES = {
    "LICENSE.txt",
}


def is_symlink(path: Path) -> bool:
    try:
        return path.is_symlink()
    except OSError:
        return False


def remove_target(path: Path):
    """删除路径，兼容文件、目录、symlink 三种情况"""
    if is_symlink(path) or not path.is_dir():
        path.unlink()
    elif path.is_dir():
        shutil.rmtree(path)


def copy_dir(src: Path, dest: Path, ignores: set[str] | None = None):
    """复制目录到目标位置。

    ignores 是相对 src 根的路径集合（如 {".claude-plugin/plugin.json"}）；
    对应文件/目录会被跳过，目标已存在的同名文件**保留**不动。
    """
    ignores = ignores or set()
    skipped_existing: list[Path] = []

    if dest.exists():
        # 把要保留的文件先挪到临时目录
        preserved: dict[str, bytes] = {}
        for rel in ignores:
            keep = dest / rel
            if keep.is_file():
                preserved[rel] = keep.read_bytes()
                skipped_existing.append(keep)
        remove_target(dest)
    else:
        preserved = {}

    def _ignore(dirpath: str, names: list[str]) -> list[str]:
        rel_dir = Path(dirpath).resolve().relative_to(src.resolve())
        skip = []
        for name in names:
            candidate = str((rel_dir / name)).replace(os.sep, "/")
            if candidate in ignores:
                skip.append(name)
        return skip

    shutil.copytree(src, dest, ignore=_ignore)

    # 写回保留的文件
    for rel, content in preserved.items():
        out = dest / rel
        out.parent.mkdir(parents=True, exist_ok=True)
        out.write_bytes(content)

    return skipped_existing


def do_sync(dry_run: bool = False, clean: bool = False):
    """执行同步"""
    entries = load_map()

    print("\n🔄 sync-skills — 同步 submodule skills 到插件目录")
    print(f"   映射表: {MAP_FILE.relative_to(ROOT)} ({len(entries)} 条)")
    if dry_run:
        print("   (dry-run 模式，不会实际写入)\n")
    else:
        print()

    synced = 0
    skipped = 0
    errors = 0

    for entry in entries:
        source_rel = entry["source"]
        target_rel = entry["target"]
        optional = entry.get("optional", False)

        abs_src = ROOT / source_rel
        abs_dest = ROOT / target_rel
        label = f"{source_rel} → {target_rel}"

        # 检查源是否存在
        if not abs_src.exists():
            if optional:
                print(f"  ⏭  [可选·跳过] {label}")
                skipped += 1
                continue
            print(f"  ❌ 源不存在: {abs_src}")
            errors += 1
            continue

        if dry_run:
            if is_symlink(abs_dest):
                action = "替换 symlink"
            elif abs_dest.exists():
                action = "清除后复制" if clean else "覆盖"
            else:
                action = "新建"
            print(f"  📋 [{action}] {label}")
            synced += 1
            continue

        # 实际同步
        try:
            if is_symlink(abs_dest) or clean:
                remove_target(abs_dest)

            abs_dest.parent.mkdir(parents=True, exist_ok=True)

            # 插件级映射（source 是完整插件目录）：保留本仓库版本的 plugin.json 等文件
            is_plugin_level = (abs_src / ".claude-plugin" / "plugin.json").exists()
            ignores = PLUGIN_LEVEL_IGNORES if is_plugin_level else SKILL_LEVEL_IGNORES

            copy_dir(abs_src, abs_dest, ignores=ignores)
            note = "  🔒 plugin.json 保留" if is_plugin_level else ""
            print(f"  ✅ {label}{note}")
            synced += 1
        except Exception as e:
            print(f"  ❌ {label}: {e}")
            errors += 1

    print(f"\n📊 完成: 同步 {synced}, 跳过 {skipped}, 错误 {errors}\n")

    if errors > 0:
        print("💡 提示: 如果源不存在，请先初始化 submodule:")
        print("   git submodule update --init --recursive\n")
        sys.exit(1)


# ─── Upstream 检测 / 同步 ────────────────────────────────────────────────────

def list_submodules() -> list[str]:
    """返回 .gitmodules 中所有 submodule 的路径"""
    try:
        out = subprocess.check_output(
            ["git", "config", "--file", str(ROOT / ".gitmodules"),
             "--get-regexp", r"submodule\..*\.path"],
            text=True, cwd=ROOT,
        )
        return [line.split(" ", 1)[1] for line in out.strip().splitlines() if line]
    except subprocess.CalledProcessError:
        return []


def detect_default_branch(submodule_path: Path) -> str:
    """探测 submodule 的 upstream 默认分支（通常是 main 或 master）"""
    try:
        # 优先用 origin/HEAD 的符号引用
        ref = subprocess.check_output(
            ["git", "symbolic-ref", "refs/remotes/origin/HEAD"],
            text=True, cwd=submodule_path, stderr=subprocess.DEVNULL,
        ).strip()
        return ref.rsplit("/", 1)[1]
    except subprocess.CalledProcessError:
        pass

    # 退而求其次：用 ls-remote 找 HEAD 指向
    try:
        out = subprocess.check_output(
            ["git", "ls-remote", "--symref", "origin", "HEAD"],
            text=True, cwd=submodule_path,
        )
        for line in out.splitlines():
            if line.startswith("ref:"):
                return line.split()[1].rsplit("/", 1)[1]
    except subprocess.CalledProcessError:
        pass
    return "main"


def check_upstream(quiet: bool = False) -> int:
    """检测每个 submodule 是否落后 upstream。返回 exit code：0=全部最新，2=至少一个落后。"""
    submodules = list_submodules()
    if not submodules:
        if not quiet:
            print("⚠️  未找到 submodule")
        return 0

    behind_count = 0
    summary_lines = []

    if not quiet:
        print("\n🔍 检查 submodule upstream 更新...\n")

    for sm in submodules:
        sm_path = ROOT / sm
        if not (sm_path / ".git").exists():
            if not quiet:
                print(f"  ⏭  {sm}: 未初始化 (跑 git submodule update --init)")
            continue

        branch = detect_default_branch(sm_path)

        # fetch 最新引用（quiet 模式压日志）
        fetch_args = ["git", "fetch", "origin", branch]
        if quiet:
            fetch_args.insert(2, "--quiet")
        try:
            subprocess.run(fetch_args, cwd=sm_path, check=True,
                           capture_output=quiet, text=True)
        except subprocess.CalledProcessError as e:
            if not quiet:
                print(f"  ❌ {sm}: fetch 失败 ({e})")
            continue

        try:
            local = subprocess.check_output(
                ["git", "rev-parse", "HEAD"], cwd=sm_path, text=True
            ).strip()
            remote = subprocess.check_output(
                ["git", "rev-parse", f"origin/{branch}"], cwd=sm_path, text=True
            ).strip()
        except subprocess.CalledProcessError:
            continue

        if local == remote:
            if not quiet:
                print(f"  ✅ {sm}: 已是最新 ({branch} @ {local[:7]})")
            continue

        # 算落后多少个 commit
        try:
            behind = int(subprocess.check_output(
                ["git", "rev-list", "--count", f"HEAD..origin/{branch}"],
                cwd=sm_path, text=True
            ).strip())
        except subprocess.CalledProcessError:
            behind = -1

        behind_count += 1
        msg = f"{sm}: 落后 {behind} commits ({local[:7]} → {remote[:7]} on {branch})"
        summary_lines.append(msg)

        if not quiet:
            print(f"  🆙 {msg}")
            # 列前 5 条 commit
            try:
                log = subprocess.check_output(
                    ["git", "log", "--oneline", "-5", f"HEAD..origin/{branch}"],
                    cwd=sm_path, text=True
                ).strip()
                for line in log.splitlines():
                    print(f"      • {line}")
            except subprocess.CalledProcessError:
                pass

    if behind_count == 0:
        if not quiet:
            print("\n✨ 所有 submodule 已是最新\n")
        return 0

    if quiet:
        # quiet 模式只输出一行总结，供 hook 使用
        print(f"💡 submodule 有更新（{behind_count} 个）：跑 "
              f"`python .claude/skills/sync-skills/scripts/sync-skills.py --update` 拉取")
        for line in summary_lines:
            print(f"   - {line}")
    else:
        print(f"\n📊 共 {behind_count} 个 submodule 落后 upstream")
        print("💡 跑 `python .claude/skills/sync-skills/scripts/sync-skills.py --update` 拉取并同步\n")
    return 2


def pull_upstream():
    """把所有 submodule 拉到 upstream HEAD（远程跟踪分支最新 commit）"""
    print("\n⬇️  拉取 submodule upstream HEAD...\n")
    try:
        subprocess.run(
            ["git", "submodule", "update", "--remote", "--recursive"],
            cwd=ROOT, check=True,
        )
        print("\n✅ submodule 已更新到 upstream HEAD")
        print("   下一步：跑 sync 把内容刷到镜像目录，或直接 --update 一气呵成\n")
    except subprocess.CalledProcessError as e:
        print(f"\n❌ pull-upstream 失败: {e}\n")
        sys.exit(1)


# ─── CLI ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="同步 submodule skills 到插件目录",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  python .claude/skills/sync-skills/scripts/sync-skills.py                          # 同步所有
  python .claude/skills/sync-skills/scripts/sync-skills.py --dry-run                # 预览
  python .claude/skills/sync-skills/scripts/sync-skills.py --clean                  # 强制重新复制
  python .claude/skills/sync-skills/scripts/sync-skills.py --add SOURCE TARGET      # 添加新映射
  python .claude/skills/sync-skills/scripts/sync-skills.py --add-plugin PLUGIN      # 添加整个插件映射
  python .claude/skills/sync-skills/scripts/sync-skills.py --list                   # 列出当前映射
""",
    )
    parser.add_argument("--dry-run", action="store_true", help="仅打印操作，不实际写入")
    parser.add_argument("--clean", action="store_true", help="先删除目标再复制")
    parser.add_argument("--add", nargs=2, metavar=("SOURCE", "TARGET"),
                        help="添加新的 skill 映射 (相对于仓库根)")
    parser.add_argument("--add-plugin", metavar="PLUGIN_NAME",
                        help="添加整个插件映射 (自动构建 source → target 路径，替换旧散装条目)")
    parser.add_argument("--optional", action="store_true",
                        help="与 --add 或 --add-plugin 配合，标记为可选（源不存在时不报错）")
    parser.add_argument("--list", action="store_true", help="列出当前所有映射")
    parser.add_argument("--check-upstream", action="store_true",
                        help="检查 submodule 是否落后 upstream（不修改 working tree）；有更新返回 exit code 2")
    parser.add_argument("--quiet", action="store_true",
                        help="与 --check-upstream 配合，仅输出一行总结，供 hook 使用")
    parser.add_argument("--pull-upstream", action="store_true",
                        help="把所有 submodule 拉到 upstream HEAD (= git submodule update --remote)")
    parser.add_argument("--update", action="store_true",
                        help="pull-upstream + sync 一气呵成；同步完看 git status 决定是否 commit")

    args = parser.parse_args()

    if args.add:
        add_entry(args.add[0], args.add[1], optional=args.optional)
        return

    if args.add_plugin:
        add_plugin_entry(args.add_plugin, optional=args.optional)
        return

    if args.list:
        entries = load_map()
        print(f"\n📋 当前映射表 ({len(entries)} 条):\n")
        for i, e in enumerate(entries, 1):
            opt = " [可选]" if e.get("optional") else ""
            print(f"  {i:2d}. {e['source']}")
            print(f"      → {e['target']}{opt}")
        print()
        return

    if args.check_upstream:
        sys.exit(check_upstream(quiet=args.quiet))

    if args.pull_upstream:
        pull_upstream()
        return

    if args.update:
        pull_upstream()
        do_sync(dry_run=False, clean=False)
        return

    do_sync(dry_run=args.dry_run, clean=args.clean)


if __name__ == "__main__":
    main()
