#!/usr/bin/env python3
"""PreToolUse hook: 在 git commit 前自动更新子模块并同步 skills。"""
import sys, json, subprocess, os

try:
    data = json.load(sys.stdin)
except (json.JSONDecodeError, EOFError):
    sys.exit(0)

tool_name = data.get("tool_name", "")
tool_input = data.get("tool_input", "")

# 仅拦截 Bash 执行 git commit 的命令
if tool_name != "Bash" or "git commit" not in str(tool_input):
    sys.exit(0)

# 不在 .git 子目录下运行（避免递归）
if ".git" in str(tool_input) and "submodule" not in str(tool_input).lower():
    # 检查是否只是操作 .git 目录（如 git config），跳过
    pass

repo_root = os.environ.get("CLAUDE_PROJECT_ROOT", ".")
os.chdir(repo_root)

print("[sync-skills] 提交前自动同步...", file=sys.stderr)

# 1. 更新子模块
ret = subprocess.run(
    ["git", "submodule", "update", "--init", "--recursive"],
    capture_output=True, text=True
)
if ret.returncode != 0:
    print(f"[sync-skills] 子模块更新失败: {ret.stderr}", file=sys.stderr)

# 2. 同步 skills
ret = subprocess.run(
    [sys.executable, ".claude/skills/sync-skills/scripts/sync-skills.py"],
    capture_output=True, text=True
)
if ret.returncode != 0:
    print(f"[sync-skills] 同步失败: {ret.stderr}", file=sys.stderr)
else:
    print("[sync-skills] 同步完成", file=sys.stderr)

sys.exit(0)