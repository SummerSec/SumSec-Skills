# SumSec-Skills 仓库说明（供 Agent）

本仓库为 **个人 Agent Skills 集合**，与具体业务代码仓库分离，仅存放可复用的 `SKILL.md` 及附属资源。

## 发现与使用

- 所有 skill 位于仓库根目录下的 **`skills/<skill-name>/`**。
- 每个 skill 的入口为 **`skills/<skill-name>/SKILL.md`**，顶部 YAML frontmatter 中的 **`description`** 用于判断是否与本任务相关。
- 当用户任务与某个 skill 的 `description` 匹配时：**先读取并遵循该 `SKILL.md`**，再按需读取其同目录下 **`references/`**、**`scripts/`**、**`assets/`**、**`rules/`** 等由 `SKILL.md` 直接链接的文件；不要在未阅读 skill 的情况下用通用流程替代。
- 执行 skill 时遵守其中的确认门槛、工作流顺序与输出格式要求。

## 布局约定

- `name`：小写字母、数字、连字符；与目录名 `skill-name` 一致。
- 正文保持可执行、可检查；大段参考资料放在 `references/`，并在 `SKILL.md` 中链接。

## 插件元数据维护

- 若仓库存在 `.claude-plugin/plugin.json` 与 `.claude-plugin/marketplace.json`，则在**发布新版本、调整插件名/描述、或新增/删除重要 skill** 时，同步检查并更新这两个文件。
- 版本号、描述、关键词、marketplace 中的插件列表应与仓库当前实际内容保持一致，避免 README、skills 目录与插件元数据脱节。
- 若本次改动不影响插件对外可见信息，可保持版本不变；若会影响安装、发现或插件说明，优先更新相应字段。

## 当前技能一览

| 目录 | 用途 |
|------|------|
| `skills/skill-optimizer/` | 路径 A：审查、规划、确认后改 skill；路径 B：会话 jsonl + 八维只读审计报告 |
| `skills/git-commit-pr/` | 在真实仓库中安全完成 commit、push、PR/MR，先检查仓库与分支状态再执行 |
| `skills/find-skills/` | 帮助用户从开放 skills 生态发现、搜索与安装可复用技能（Skills CLI、`skills.sh`） |
| `skills/humanizer-zh/` | 本地 CLI（humanize-chinese）+ 深度指南 v2.2：含「反 AI 审查」二遍（初稿→自问残留→终稿）；无法用脚本时按 SKILL 维基式规则编辑 |
| `skills/remotion-best-practices/` | Remotion（React 视频）领域实践：按 `SKILL.md` 索引按需加载 `rules/*.md`（composition、动画、字幕、FFmpeg、图表等） |
| `skills/creating-blog-web-ppt/` | 将 Markdown 文章转为网页版 PPT（slide-writer 对齐 + `blog-sumsec` 主题）；同目录落盘、SUMSEC 回链等见 `references/` |

（随仓库增加 skill 时，维护者可在此表追加一行。）
