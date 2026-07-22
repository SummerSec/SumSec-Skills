---
name: sync-skills
description: "管理 submodule skill 与插件同步：添加/删除映射、运行同步脚本。sync skills、sync plugins、skill-map.json、--add-plugin、从 submodule 导入"
---

# Sync Skills — Submodule Skill 与插件同步管理

## 概述

本仓库从 git submodule（`claude-plugins-official`、`context7` 等）引用第三方 skill 和插件，通过 **复制同步** 管理。

支持两种粒度：
- **组件级**：同步单个 skill/commands/agents/hooks 子目录到目标插件
- **插件级**：同步整个插件目录（含 plugin.json、README、LICENSE、截图等根级文件）

### 位置说明

**`.claude/skills/sync-skills/`** 是本 skill 的**唯一源**，包含 SKILL.md、脚本和映射表，应直接提交到 git。
`agents-dev/skills/sync-skills/` 是同步到 agents-dev 插件的副本，不提交到 git。

### 核心文件

| 文件 | 说明 |
|------|------|
| `scripts/sync-skills.py` | 同步脚本（Python 3 标准库，无额外依赖） |
| `scripts/skill-map.json` | 工作映射表（`source → target`），**可编辑** |
| `scripts/skill-map.default.json` | 默认模板，`skill-map.json` 不存在时从中初始化 |

> `skill-map.json` 是唯一操作入口；`skill-map.default.json` 仅作模板，不要直接编辑。

## 何时使用

- 用户要求「添加一个来自 submodule 的 skill」「同步 skills」「新增映射」
- 用户提到 `skill-map.json`、`sync-skills.py`
- 需要从 `claude-plugins-official` 或其他 submodule 引入新 skill/插件
- 用户要求「添加插件」「同步插件」「从 submodule 复制插件」

## 工作流

### 添加新 skill 映射（组件级）

1. 确认源路径（submodule 内的 skill 目录）和目标路径（本仓插件目录下的位置）
2. 执行添加命令：
   ```bash
   python .claude/skills/sync-skills/scripts/sync-skills.py --add "<source_relative_path>" "<target_relative_path>"
   # 如果源可能不存在（可选依赖），加 --optional
   python .claude/skills/sync-skills/scripts/sync-skills.py --add "<source>" "<target>" --optional
   ```
3. 运行同步：
   ```bash
   python .claude/skills/sync-skills/scripts/sync-skills.py
   ```
4. 确认 `.gitignore` 中已添加对应的目标目录忽略规则

### 添加整个插件映射（插件级）

适用于纯镜像插件（目标完全来自 submodule，无自定义代码）。一条命令替换所有散装映射：

```bash
python .claude/skills/sync-skills/scripts/sync-skills.py --add-plugin <plugin_name>
```

**行为**：
- 自动构建路径：`claude-plugins-official/plugins/<name>` → `<name>`
- 清除该 target 下所有旧的散装映射（如 `skills/`、`commands/` 等单独条目）
- 同步时复制整个插件目录（含 plugin.json、README、LICENSE、截图等）
- 输出 `.gitignore` 建议：整个插件目录应忽略不提交

**适用条件**：
- 目标插件是 submodule 源的**完整镜像**（无自定义代码混入）
- 反面例子：`hookify`、`plugin-dev` 有自定义 Python/配置，只能用组件级映射

**完整流程**：

```bash
# 1. 添加插件映射
python .claude/skills/sync-skills/scripts/sync-skills.py --add-plugin claude-md-management

# 2. 执行同步并提交（不再需要改 .gitignore）
python .claude/skills/sync-skills/scripts/sync-skills.py
git add claude-md-management/
git commit -m "feat(claude-md-management): mirror from upstream"
```

### 自动同步（提交前）

`.claude/settings.json` 中配置了 PreToolUse hook，每次 `git commit` 前自动执行：

1. `git submodule update --init --recursive` — 把 submodule 同步到 `.gitmodules` 锁定的 commit（**不**自动追 upstream 最新；想拉新版要主动跑 `--remote`，见下节）
2. `python3 sync-skills.py` — 把 submodule 内容复制到目标插件目录

无需手动操作，提交时自动触发。

### Upstream 升级流程

镜像插件（`claude-md-management` / `plugin-dev` 等）的内容来自 submodule upstream，**但版本号、发布节奏由本仓库控制**。详见下节「版本与内容分治原则」。

**判断 upstream 是否有更新**：

```bash
# 检查所有 submodule 是否落后 upstream（不修改 working tree）
python .claude/skills/sync-skills/scripts/sync-skills.py --check-upstream

# 输出示例：
#   🆙 claude-plugins-official: 落后 12 commits (abc1234 → def5678 on main)
#       • def5678 feat(claude-md-management): add ...
#       • ...
#   ✅ context7: 已是最新
# exit code: 0=全部最新, 2=至少一个落后
```

SessionStart hook 已配置 `--check-upstream --quiet`，每次 Claude Code 启动会自动检查并提示。

**应用升级**：

```bash
# 拉 upstream HEAD 并同步内容到镜像目录（不 commit）
python .claude/skills/sync-skills/scripts/sync-skills.py --update

# 看变化、评审
git status --short
git diff <changed-dirs>

# 接受 → commit；不要 → git restore 对应目录
git add <accepted-dirs> && git commit -m "sync(upstream): pull from claude-plugins-official@<sha>"

# 若是面向用户的变更，按 multi-platform-plugin-guide bump 全仓版本
```

**单独命令**：

```bash
python .claude/skills/sync-skills/scripts/sync-skills.py --pull-upstream   # 只拉 submodule HEAD，不 sync
python .claude/skills/sync-skills/scripts/sync-skills.py                   # 只 sync，submodule 不动
```

### 手动同步

```bash
# 预览（不写入）
python .claude/skills/sync-skills/scripts/sync-skills.py --dry-run

# 正式同步
python .claude/skills/sync-skills/scripts/sync-skills.py

# 强制清除后重新复制
python .claude/skills/sync-skills/scripts/sync-skills.py --clean
```

### 查看当前映射

```bash
python .claude/skills/sync-skills/scripts/sync-skills.py --list
```

### 新机器安装流程

```bash
git clone --recurse-submodules https://github.com/SummerSec/SumSec-Skills.git
cd SumSec-Skills
python .claude/skills/sync-skills/scripts/sync-skills.py
```

## 规则

- **版本与内容分治原则**：镜像插件（来自 submodule）遵循「**版本号以本仓库为准、内容以 submodule upstream 为准**」。
  - **Why:** 全仓 manifest 都对齐到本仓库 release 版本（如 `1.0.22`），不让 upstream 各插件的独立版本号（plugin-dev 1.0.0、claude-md-management 1.0.0……）污染本仓库节奏；同时内容由 `sync-skills.py` 自动从 submodule 复制，不在镜像目录里手改文件——避免 sync 把改动覆盖。
  - **How to apply:**
    - **不要**手动编辑镜像目录下的 SKILL.md / scripts / references（如 `claude-md-management/skills/*`、`plugin-dev/skills/*`）——下次 sync 会被 upstream 覆盖；要改就改 upstream 或加新插件。
    - **`<mirror>/.claude-plugin/plugin.json` 被 sync 自动保留**：sync 脚本通过 `PLUGIN_LEVEL_IGNORES` 排除该文件，确保本仓库的 `version` 字段不被 upstream 覆盖（详见 `sync-skills.py` 顶部常量）。手改 plugin.json 版本号是安全的，下次 sync 不会动它。
    - upstream 升级走「Upstream 升级流程」章节，sync 后人工评审 diff 再 commit。
- **不要自动整合 skill 到聚合插件**：来自 submodule 的 skill 默认按其所属的**独立插件**整体镜像（插件级映射）；不要把它从所属插件里抽出来再塞进 `agents-dev` 这类聚合插件。**仅当用户明确要求「聚合到 X 插件」「合并到 agents-dev」时**，才追加额外的组件级映射。
  - **Why:** 一个 skill 同时存在于「独立插件」和「聚合插件」会造成双轨上架、文档脱节、版本难对齐。
  - **How to apply:** 用户说「同步插件 X」「添加插件 X」时，只加一条插件级映射 `<source>/X → X/`，不动 `agents-dev/` 或其它聚合插件；想聚合必须由用户主动开口。
- **映射表是唯一来源**：所有 source → target 关系必须记录在 `.claude/skills/sync-skills/scripts/skill-map.json`
- **目标目录需要提交**：同步生成的目录是 marketplace 上架内容（`./claude-md-management`、`./plugin-dev` 等），不提交会导致远端用户安装时目录为空。upstream submodule 升级后重跑 sync，把 diff 一起 commit。
- **不再使用 `.gitignore` 拦截同步产物**：旧设计曾把这些目录 ignored，导致 marketplace 注册的插件在远端不可装。已废弃，不要再加回去。
- **插件级映射需 `git rm --cached`**：如果目标目录之前提交过文件，需先从 git 跟踪中移除后再同步
- **submodule 必须先初始化**：同步前确保 `git submodule update --init --recursive` 已执行
- **`optional: true`**：用于源可能不存在的实验性 skill/插件，同步时跳过而非报错

## skill-map.json 格式

支持两种条目类型：

### 组件级映射

```json
{
  "source": "claude-plugins-official/plugins/plugin-dev/skills/agent-development",
  "target": "agents-dev/skills/agent-development"
}
```

### 插件级映射

```json
{
  "source": "claude-plugins-official/plugins/claude-md-management",
  "target": "claude-md-management"
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `source` | ✅ | 相对仓库根的源目录路径（子目录或整个插件） |
| `target` | ✅ | 相对仓库根的目标目录路径 |
| `optional` | ❌ | 为 `true` 时源不存在不报错，默认 `false` |

### 何时用组件级 vs 插件级

> ⚠️ **默认走插件级**。来自 submodule 的插件就保持插件本体，不要拆开塞进 `agents-dev` 等聚合插件。组件级映射仅用于以下两种情况，且**第二种必须由用户明确发起**。

| 场景 | 粒度 | 示例 | 需要用户明确同意？ |
|------|------|------|------|
| 目标插件含自定义代码，需混入 submodule 的部分内容 | 组件级 | `plugin-dev`（有自写配置） | 否（结构使然） |
| 目标是 submodule 的完整镜像 | 插件级 | `claude-md-management`、`plugin-dev` | 否（默认） |
| 把一个 submodule skill 抽到聚合插件 | 组件级 | `agents-dev/skills/xxx` ← 来自其它插件 | ✅ **必须用户主动要求** |
