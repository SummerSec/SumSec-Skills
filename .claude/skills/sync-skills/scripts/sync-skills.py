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

映射关系从同目录下的 skill-map.json 读取；若文件不存在，从 skill-map.default.json 初始化。
支持通过 --add 命令自动追加新映射，通过 --add-plugin 添加整个插件映射。
"""

import os
import sys
import json
import shutil
import argparse
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


def copy_dir(src: Path, dest: Path):
    if dest.exists():
        remove_target(dest)
    shutil.copytree(src, dest)


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
            copy_dir(abs_src, abs_dest)
            print(f"  ✅ {label}")
            synced += 1
        except Exception as e:
            print(f"  ❌ {label}: {e}")
            errors += 1

    print(f"\n📊 完成: 同步 {synced}, 跳过 {skipped}, 错误 {errors}\n")

    if errors > 0:
        print("💡 提示: 如果源不存在，请先初始化 submodule:")
        print("   git submodule update --init --recursive\n")
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

    do_sync(dry_run=args.dry_run, clean=args.clean)


if __name__ == "__main__":
    main()
