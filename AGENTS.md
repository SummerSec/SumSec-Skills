# SumSec-Skills 仓库说明（供 Agent）

本仓库为 **个人 Agent Skills 集合**，与具体业务代码仓库分离，仅存放可复用的 `SKILL.md` 及附属资源。

## 发现与使用

- 所有 skill 位于仓库根目录下的 **`skills/<skill-name>/`**。
- 每个 skill 的入口为 **`skills/<skill-name>/SKILL.md`**，顶部 YAML frontmatter 中的 **`description`** 用于判断是否与本任务相关。
- 当用户任务与某个 skill 的 `description` 匹配时：**先读取并遵循该 `SKILL.md`**，再按需读取其同目录下 **`references/`**、**`scripts/`**、**`assets/`** 中由 `SKILL.md` 直接链接的文件；不要在未阅读 skill 的情况下用通用流程替代。
- 执行 skill 时遵守其中的确认门槛、工作流顺序与输出格式要求。

## 布局约定

- `name`：小写字母、数字、连字符；与目录名 `skill-name` 一致。
- 正文保持可执行、可检查；大段参考资料放在 `references/`，并在 `SKILL.md` 中链接。

## 当前技能一览

| 目录 | 用途 |
|------|------|
| `skills/skill-optimizer/` | 路径 A：审查、规划、确认后改 skill；路径 B：会话 jsonl + 八维只读审计报告 |

（随仓库增加 skill 时，维护者可在此表追加一行。）
