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

# 2. 更新 .gitignore（按脚本输出的建议）
echo "# claude-md-management: from claude-plugins-official" >> .gitignore
echo "claude-md-management/" >> .gitignore

# 3. 如果之前提交过该插件目录的文件，从 git 跟踪中移除
git rm --cached -r claude-md-management/

# 4. 执行同步
python .claude/skills/sync-skills/scripts/sync-skills.py
```

### 自动同步（提交前）

`.claude/settings.json` 中配置了 PreToolUse hook，每次 `git commit` 前自动执行：

1. `git submodule update --init --recursive` — 更新子模块
2. `python3 sync-skills.py` — 同步 skills

无需手动操作，提交时自动触发。

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

- **映射表是唯一来源**：所有 source → target 关系必须记录在 `.claude/skills/sync-skills/scripts/skill-map.json`
- **目标目录不提交**：同步产生的目标目录已在 `.gitignore` 中忽略，不要 `git add` 它们
- **新增映射后同步 `.gitignore`**：每次 `--add` 或 `--add-plugin` 后，检查 `.gitignore` 是否已包含新目标路径，未包含则追加
  - 组件级：忽略具体子目录（如 `plugin-dev/skills/`）
  - 插件级：忽略整个插件目录（如 `claude-md-management/`）
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

| 场景 | 粒度 | 示例 |
|------|------|------|
| 目标插件含自定义代码，只需同步部分内容 | 组件级 | `plugin-dev`（有自写配置） |
| 目标是 submodule 的完整镜像 | 插件级 | `claude-md-management`、`claude-code-setup` |
| 多插件共享同一源的不同部分 | 组件级 | `agents-dev` 从多个源聚合 skills |
