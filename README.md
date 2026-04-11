# SumSec-Skills

SummerSec 个人自定义 Agent Skills 仓库：集中存放、版本化管理可在多工具间复用的技能说明（`SKILL.md` 及引用资源）。

## 目录结构

```text
SumSec-Skills/
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

## 本地使用方式

按需将某一 skill 目录复制或同步到本机 Agent 技能目录即可，例如：

- Cursor 个人技能：`~/.cursor/skills/<skill-name>/`
- 其他工具若支持 `~/.agents/skills/`，亦可同步到对应路径。

具体路径以你所用客户端文档为准。

## 已有技能

| 技能目录 | 说明 |
|----------|------|
| [skills/skill-optimizer](skills/skill-optimizer/) | 路径 A：确认后改 skill；路径 B：`/optimize-skill` 类只读八维审计 |

## 许可

见仓库根目录 [LICENSE](LICENSE)。
