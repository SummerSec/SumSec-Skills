#!/usr/bin/env python3
"""SessionStart hook: 静默检查 submodule upstream 是否有更新。

调用 sync-skills.py --check-upstream --quiet；
脚本会自己输出提示。任何失败（网络问题、git 异常）都吞掉不打扰 session。
"""
import os
import sys
import subprocess

# 限时，避免网络慢拖累 SessionStart
TIMEOUT_SECONDS = 15

def get_repo_root() -> str:
    try:
        return subprocess.check_output(
            ["git", "rev-parse", "--show-toplevel"], text=True
        ).strip()
    except Exception:
        return os.getcwd()

def main():
    root = get_repo_root()
    script = os.path.join(root, ".claude", "skills", "sync-skills", "scripts", "sync-skills.py")
    if not os.path.exists(script):
        sys.exit(0)

    try:
        subprocess.run(
            ["python3", script, "--check-upstream", "--quiet"],
            cwd=root, timeout=TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        pass  # 网络慢，下次再说
    except Exception:
        pass  # 任何错误都不打扰 SessionStart

    sys.exit(0)

if __name__ == "__main__":
    main()
