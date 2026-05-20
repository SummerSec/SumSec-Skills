---
name: sync-skills
description: "管理 submodule skill 同步：添加/删除映射、运行同步脚本、替代 symlink。sync skills、skill-map.json、从 submodule 导入 skill"
---

# Sync Skills — Submodule Skill 同步管理

## 概述

本仓库从 git submodule（`claude-plugins-official`、`context7` 等）引用第三方 skill，通过 **复制同步** 替代 symlink（symlink 在其他机器 clone 后无法解析）。

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
- 用户提到 `skill-map.json`、`sync-skills.py`、symlink 替代方案
- 需要从 `claude-plugins-official` 或其他 submodule 引入新 skill 到某个插件目录

## 工作流

### 添加新 skill 映射

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

### 执行同步

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

- **映射表是唯一来源**：所有 source → target 关系必须记录在 `.claude/skills/sync-skills/scripts/skill-map.json`，不要手动创建 symlink
- **目标目录不提交**：同步产生的目标目录已在 `.gitignore` 中忽略，不要 `git add` 它们
- **新增映射后同步 `.gitignore`**：每次 `--add` 后，检查 `.gitignore` 是否已包含新目标路径，未包含则追加
- **submodule 必须先初始化**：同步前确保 `git submodule update --init --recursive` 已执行
- **`optional: true`**：用于源可能不存在的实验性 skill，同步时跳过而非报错

## skill-map.json 格式

```json
[
  {
    "source": "claude-plugins-official/plugins/plugin-dev/skills/agent-development",
    "target": "agents-dev/skills/agent-development"
  },
  {
    "source": "some/optional/skill",
    "target": "some-plugin/skills/optional-skill",
    "optional": true
  }
]
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `source` | ✅ | 相对仓库根的源目录路径（通常在 submodule 内） |
| `target` | ✅ | 相对仓库根的目标目录路径（插件 skills 目录下） |
| `optional` | ❌ | 为 `true` 时源不存在不报错，默认 `false` |
