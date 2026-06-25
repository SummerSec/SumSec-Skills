# Writing-ZH 插件

中文写作辅助插件，包含以下技能：

## 技能清单

| 命令 | 技能目录 | 来源 | 说明 |
|------|---------|------|------|
| `humanizer-zh` | `skills/humanizer-zh/SKILL.md` | 本仓库 | 去 AI 味：本地 CLI 深度指南，反 AI 审查二遍工作流 |
| `creating-blog-web-ppt` | `skills/creating-blog-web-ppt/SKILL.md` | 本仓库 | Markdown 文章转网页版 PPT（slide-writer + blog-sumsec 主题） |
| `khazix-writer` | `skills/khazix-writer/SKILL.md` | khazix-skills | 卡兹克写作风格：用特定口吻和节奏写公众号长文 |
| `sumsec-illustrations` | `skills/sumsec-illustrations/SKILL.md` | 本仓库 | 为 sumsec.me 风格文章生成 SumSec Observer 正文配图 |

## 插图生成注意

- 使用 `sumsec-illustrations` 前先读 `SKILL.md` 及其直接链接的 `references/style-dna.md`、`references/sumsec-observer.md`、`references/prompt-template.md`、`references/qa-checklist.md`。
- 生成 SumSec Observer 时，以 `skills/sumsec-illustrations/assets/sumsec-observer-target.png` 为人物、衣服、工具包、夹板、戒指与低情绪工作状态的优先参考。
- 项目或文章配图落到 `assets/<slug>-illustrations/`，保留原始生成图，不覆盖已有资产，除非用户明确要求替换。

## 安装路径

用户配置路径（无需修改）：技能位于本插件 `skills/` 下，通过 marketplace 自动加载。
