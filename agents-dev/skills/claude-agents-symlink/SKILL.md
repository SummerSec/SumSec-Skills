---
name: claude-agents-symlink
description: 将项目根目录的 Claude 记忆文件统一为指向根目录 AGENTS 文件的软链接。用于用户要求把 `CLAUDE.md` 或 `claude.md` 指向 `AGENTS.md` 或 `agents.md`、希望批量统一多个项目的根目录记忆文件，或需要兼容 Windows、macOS、Linux 的跨平台软链接处理流程时。
---

# CLAUDE 指向 AGENTS 软链接统一

## 目标

将仓库根目录的 Claude 文件改为指向根目录 AGENTS 文件的软链接，同时对已有的非链接文件保持保守处理。

## 工作流

1. 确认项目根目录。
   优先使用 `git rev-parse --show-toplevel`。如果当前目录不是 Git 仓库，就使用用户明确提供的根目录路径。
2. 定位目标 AGENTS 文件。
   接受 `AGENTS.md` 或 `agents.md`。如果两者都不存在，停止并询问用户哪个文件应该作为真实来源。
3. 检查 Claude 侧文件。
   接受 `CLAUDE.md` 或 `claude.md`。
   如果它已经是指向 AGENTS 文件的软链接，直接报告成功并停止。
   如果它是普通文件，或者软链接指向了别处，先检查内容，再决定是否替换。
4. 保护已有内容。
   如果现有 Claude 文件不是软链接且包含独立内容，不要静默覆盖。替换前必须征得用户确认。
5. 优先使用随附脚本。
   使用 `scripts/ensure_claude_symlink.py`，这样同一套流程可以同时覆盖 Windows、macOS、Linux。
6. 变更后再次校验。
   确认软链接已创建、指向的是 AGENTS 文件、使用相对目标路径，并把备份路径回报给用户。

## 推荐命令

优先在项目根目录执行随附脚本。

macOS / Linux:

```bash
python3 scripts/ensure_claude_symlink.py --root "$(git rev-parse --show-toplevel)"
```

Windows PowerShell:

```powershell
py -3 scripts/ensure_claude_symlink.py --root (git rev-parse --show-toplevel)
```

如果检查后确认需要替换已有 Claude 文件：

```bash
python3 scripts/ensure_claude_symlink.py \
  --root "$(git rev-parse --show-toplevel)" \
  --replace-existing
```

## 安全规则

- 未经明确批准，不要覆盖一个不是软链接的 Claude 文件。
- 替换前优先备份已有 Claude 文件。除非显式传入 `--no-backup`，随附脚本会自动保留备份。
- 如果一侧已经存在文件名大小写形式，尽量沿用该形式。
- 优先使用相对软链接目标，例如 `AGENTS.md`，保证仓库跨机器迁移时仍可用。
- 如果仓库有意采用反向关系，例如 `AGENTS.md -> CLAUDE.md`，先停下来确认，不要直接翻转。
- 如果大写和小写变体同时存在，不要猜测，先让用户明确选择规范文件名。

## Windows 说明

- Python 在 Windows 上可以创建软链接，但如果系统未开启开发者模式，或者当前 shell 缺少权限，可能会失败。
- 如果 Python 创建软链接失败，要把具体报错告诉用户，并建议先完成以下任一处理后再重试：
  - 开启 Windows 开发者模式。
  - 使用管理员权限重新运行 shell。
  - 改用 Windows 原生命令重试。

PowerShell 兜底命令：

```powershell
New-Item -ItemType SymbolicLink -Path CLAUDE.md -Target AGENTS.md -Force
```

`cmd.exe` 兜底命令：

```cmd
mklink CLAUDE.md AGENTS.md
```

## 校验

- 在 macOS 或 Linux 上，使用 `ls -l CLAUDE.md AGENTS.md`。
- 在 Windows PowerShell 上，使用 `Get-Item CLAUDE.md | Select-Object LinkType, Target`。
- 确认通过 `CLAUDE.md` 和 `AGENTS.md` 读取到的是同一份内容。
