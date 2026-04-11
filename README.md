# SumSec-Skills

SummerSec 个人自定义 Agent Skills 仓库：集中存放、版本化管理可在多工具间复用的技能说明（`SKILL.md` 及引用资源）。

## 目录结构

```text
SumSec-Skills/
├── .claude-plugin/        # Claude Code plugin 元数据
├── AGENTS.md              # 在本仓库内工作时给 Agent 的指引
├── README.md
├── skills/
│   └── <skill-name>/
│       ├── SKILL.md       # 必填：frontmatter + 正文工作流
│       ├── references/    # 可选：由 SKILL.md 链接的长文档
│       ├── scripts/       # 可选：可执行脚本
│       └── assets/        # 可选：模板、示例文件等
```

## 约定

- **frontmatter** 仅使用 `name` 与 `description`（与常见 Cursor / Claude skill 规范一致）。
- **`name`**：小写连字符，与文件夹名一致。
- **`description`**：同时写清「做什么」与「何时用」，便于 Agent 自动选用。
- 细节与检查清单尽量下沉到 **`references/`**，避免单文件过长。

## 安装方式

本仓库是**多个 skill 的源码集合**。优先推荐使用 **Claude Code Plugin 安装**；若当前环境不支持，再退回到「克隆仓库 + 复制 / 软链整目录」方式。无论使用哪种方式，都应保留 **`skills/<skill-name>/` 整个目录**（含 `references/` 等），不要只下载单个 `SKILL.md`，否则相对链接会断。

### Claude Code Plugin 安装

本仓库提供：

- `.claude-plugin/plugin.json`
- `.claude-plugin/marketplace.json`

当前插件信息：

- 插件名：`sumsec`
- 市场包名：`sumsec-skills`
- 安装 ID：`sumsec@sumsec-skills`

若你的 Claude Code 版本支持 marketplace 安装，可尝试：

```bash
claude plugin marketplace add SummerSec/SumSec-Skills
claude plugin install sumsec@sumsec-skills
```

更新：

```bash
claude plugin marketplace update
claude plugin update sumsec@sumsec-skills
```

若 CLI 尚不支持该安装方式，仍可使用下文的 `~/.claude/skills/<skill-name>/` 手动安装。

### 获取源码（推荐）

```bash
git clone https://github.com/SummerSec/SumSec-Skills.git
cd SumSec-Skills
```

之后在仓库外也可通过 `git pull` 更新，再同步到各工具目录（若使用软链则只需拉取仓库）。

### 通用：复制或软链整目录到全局技能路径

将 `skills/<skill-name>/` 放到下列**其一**（按你实际使用的客户端选择）。

| 环境 | 全局路径示例 |
|------|----------------|
| Cursor（个人技能） | `~/.cursor/skills/<skill-name>/` |
| Cursor（项目内，与官方文档一致时） | `.cursor/skills/<skill-name>/` |
| Claude Code | `~/.claude/skills/<skill-name>/` |
| OpenAI Codex CLI | `~/.codex/skills/<skill-name>/` |
| 多工具共享约定 | `~/.agents/skills/<skill-name>/` |
| OpenClaw | `~/.openclaw/skills/<skill-name>/` |
| Google Antigravity | `~/.gemini/antigravity/skills/<skill-name>/` |
| OpenCode | `~/.config/opencode/skills/<skill-name>/` |
| CodeBuddy | `~/.codebuddy/skills/<skill-name>/` |

**Linux / macOS**（在已克隆的仓库根目录，以 `skill-optimizer` 为例）：

```bash
ln -sf "$(pwd)/skills/skill-optimizer" ~/.cursor/skills/skill-optimizer
ln -sf "$(pwd)/skills/skill-optimizer" ~/.claude/skills/skill-optimizer
```

**Windows PowerShell**（目录联接无需管理员；把 `$repo` 换成你的克隆路径）：

```powershell
$repo = "D:\ghproject\SumSec-Skills"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.cursor\skills" | Out-Null
New-Item -ItemType Junction -Path "$env:USERPROFILE\.cursor\skills\skill-optimizer" -Target "$repo\skills\skill-optimizer"
```

也可用 `robocopy` / 资源管理器**复制**整文件夹到上表路径，效果相同。

### 项目级安装（仅当前业务仓库）

在具体项目里放一份 skill，只在该项目生效。

```bash
mkdir -p .agents/skills
cp -R /path/to/SumSec-Skills/skills/skill-optimizer .agents/skills/
```

若 Cursor 使用项目级 `.cursor/skills/`，可改为：

```bash
mkdir -p .cursor/skills
cp -R /path/to/SumSec-Skills/skills/skill-optimizer .cursor/skills/
```

### 可选：Vercel Skills CLI

若环境已支持通过 CLI 从 GitHub 安装 skill，可尝试：

```bash
npx skills add SummerSec/SumSec-Skills --skill skill-optimizer
```

若命令不存在、报错或只拉下部分文件，请改回「克隆仓库 + 复制/软链整目录」。

### 安装后未生效

部分客户端不会热加载新 skill，安装后**重启** Cursor / Claude Code / Codex 等再试。

具体加载规则以各工具官方文档为准。

## 已有技能

| 技能目录 | 说明 |
|----------|------|
| [skills/skill-optimizer](skills/skill-optimizer/) | 路径 A：确认后改 skill；路径 B：`/optimize-skill` 类只读八维审计 |
| [skills/git-commit-pr](skills/git-commit-pr/) | 在真实仓库里安全完成 `commit`、`push`、`PR/MR`，优先识别仓库与分支状态 |

## 许可

见仓库根目录 [LICENSE](LICENSE)。
