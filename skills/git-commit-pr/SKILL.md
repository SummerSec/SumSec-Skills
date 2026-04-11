-----
name: git-commit-pr
description: This skill should be used when the user wants to commit code changes and create a Pull Request or Merge Request. Trigger keywords include "提交PR", "提交MR", "创建PR", "创建MR", "提代码", "发MR", "commit and PR", "commit and MR", "提交并创建PR", "提交并创建MR".
allowed-tools: Read, Edit, Write, Bash, Grep, Glob, Skill
-----
# Git Commit & PR 自动化助手

用于在真实仓库里安全地完成 `commit`、`push`、`PR/MR`。  
目标不是“机械跑命令”，而是先识别仓库状态、分支状态、远程状态和平台能力，再选择合适路径执行。

## 核心能力

- 识别用户目标：`仅提交`、`仅创建 PR/MR`、`提交并创建 PR/MR`
- 识别仓库状态：工作区脏/净、当前分支、是否跟踪远程、默认基线分支
- 基于仓库历史生成更贴近本仓库风格的 commit message
- 先处理分支，再提交，再推送，再创建 PR/MR，避免顺序错误
- 优先使用 `gh` CLI 自动创建 PR，失败时降级为平台链接
- 覆盖常见失败路径：未登录、无远程、远程拒绝、分支冲突、hook 失败、无可创建 PR 的提交

## 操作边界

- 只在用户明确要求“提交 / 推送 / 创建 PR/MR”时执行这些动作。
- 不要默认 `git add .`；先列出变更，再确认是“全部提交”还是“指定文件提交”。
- 不要提交疑似敏感文件，如 `.env`、密钥、凭证、tokens、私钥导出文件；若用户坚持，先明确提醒风险。
- 不要擅自改 `git config`。
- 不要默认使用 `--force` / `--force-with-lease` / `--amend` / `--no-verify`；只有用户明确同意后才能使用。
- 若当前在 `master` / `main` 且要新增本地提交，优先新建分支，不要直接在主干上开发式提交。
- 若工作区有与本次目标无关的脏改动，先让用户决定是只暂存相关文件，还是拆分处理。

## 入口判断

先确认用户属于哪一种目标，再走对应路径：

1. **仅提交**
   - 用户要求“帮我 commit / 提交代码”，但没有要求创建 PR/MR。
2. **仅创建 PR/MR**
   - 工作区已经干净，且当前分支已有本地提交，用户只想发 PR/MR。
3. **提交并创建 PR/MR**
   - 用户希望从本地修改一路完成到远程 PR/MR。

若用户描述不清，先问一句：  
“你是要我只提交 commit，还是要连 push 和 PR 一起做？”

## 执行前快照

开始前至少检查以下信息：

- `git status --short --branch`
- `git diff --stat`
- `git diff --cached --stat`
- `git log --pretty=format:"%s" -n 20`
- `git branch --show-current`
- `git remote -v`

若要创建 PR，再补：

- `git remote show origin` 或等价命令，确认默认基线分支
- `gh auth status`
- 当前分支是否已跟踪远程
- `git diff <base-branch>...HEAD --stat`，确认确实有 PR 内容

## 工作流程

### 1. 环境前置检查

- 执行 `git status`，确保当前目录是 git 仓库。
- 检查 `git remote -v`，确认至少存在一个远程。
- 若存在多个远程（如 `origin`、`upstream`），在推送和建 PR 前确认使用哪个远程。
- 若用户要创建 GitHub PR，检查 `gh auth status`；未登录则提示用户先登录，或降级为创建链接。

### 2. 变更状态分析

- 列出未暂存、已暂存、未跟踪文件，区分：
  - `unstaged`
  - `staged`
  - `untracked`
- 若工作区干净：
  - 且当前分支相对基线已有提交：可直接进入 `push / PR`。
  - 且没有新增提交：提示“没有可提交或可建 PR 的内容”。
- 若工作区不干净：
  - 先确认提交范围，而不是默认整仓提交。
- 若检测到疑似敏感文件：
  - 中断自动提交，先向用户确认。

### 3. 暂存策略

- 默认顺序：
  1. 展示改动文件清单
  2. 让用户确认“全部提交”还是“指定文件提交”
  3. 再执行 `git add <files>`
- 只有当用户明确表示“全部一起提交”时，才可使用整批暂存。
- 若仓库中已有用户自己的脏改动，优先只暂存本次相关文件，避免误提交。

### 4. 分支管理

- 获取当前分支名 `git branch --show-current`。
- 若当前分支为 `master` 或 `main`：
  - 若用户只是补一个历史 commit 且明确要求直接在当前分支提交，再按用户意图执行。
  - 否则优先创建新分支再提交。
- 推荐分支命名：
  - `feat/<description>`
  - `fix/<description>`
  - `docs/<description>`
  - `refactor/<description>`
  - `chore/<description>`
- 分支检查点：
  - 名称合法
  - 本地是否已存在
  - 远程是否已存在
  - 是否需要切换到已有分支而不是新建
- 若当前已经在功能分支上，则沿用当前分支。

### 5. 生成 Commit Message

- 先检查仓库最近的提交主题，而不是直接套通用约定：
  - 执行 `git log --pretty=format:"%s" -n 30`
  - 优先学习当前仓库的本地风格，其次才是通用规范
- 若用户已提供完整 message，则直接使用。
- 若用户未提供 message，则按下面顺序生成：
  1. 识别仓库主风格
  2. 识别本次改动类型
  3. 生成 1 个推荐 subject，必要时再给 1~2 个备选
- 风格优先级：
  1. 仓库内最近提交有明显主流风格，优先复用
  2. 相邻模块有稳定风格，优先跟随相邻模块
  3. 仓库风格混合但不明显时，再使用约定式提交
- 当前仓库（`BlogPapers`）已观察到的风格：
  - **主风格**：`emoji + 简短主题`
  - 常见示例：`🍭Update Sitemap && AboutMe && Git Svg`
  - 常见示例：`🪄Restore normal article shell when PPT is closed`
  - 常见示例：`🎨Unify article and PPT backgrounds`
  - **兼容风格 1**：`emoji + 中文说明`，例如 `🤖 sync Cloudflare DNS 表（subdomain.md）`
  - **兼容风格 2**：约定式提交，例如 `feat(nav): ...`、`style: ...`、`fix(stats): ...`
- 在本仓库中拟定 subject 时：
  - 尽量保持单行
  - 不加句号
  - 动词前置，避免写成长摘要
  - 简单改动通常不需要 body
  - 复杂改动可补一个简短 body，说明原因或影响范围
- 若要带 body，优先使用多段提交格式，而不是拼接超长一行：
  ```bash
  git commit -m "<subject>" -m "<body>"
  ```
- 若需要更稳妥地携带多行内容，优先使用 heredoc 或等价多行字符串方案，避免转义错误。

### 6. 提交前验证

- 若仓库存在测试、lint、构建等明显验证步骤，询问是否需要在提交前执行。
- 若本次只是文档、小样式或轻量配置修改，可根据仓库习惯做最小验证。
- 若验证失败：
  - 先汇报失败原因
  - 不要假装提交成功
  - 让用户决定是先修复还是带风险继续

### 7. 执行提交

- 先确认暂存区确实只包含目标文件。
- 没有 staged 变更时，不要创建空提交。
- 提交完成后，再执行一次 `git status` 确认结果。
- 若 pre-commit hook 修改了文件：
  - 重新检查改动
  - 重新暂存
  - 再创建一次新提交，或在明确满足条件时补进同一提交
- 若 hook 失败：
  - 展示错误
  - 让用户选择修复后重试，或明确允许跳过

### 8. 推送分支

- 判断当前分支是否已跟踪远程：
  - 已跟踪：正常 `git push`
  - 未跟踪：使用 `git push -u <remote> <branch>`
- 若用户在 `master/main` 且准备直接推送主干，先再次确认是否真的要这样做。
- 若推送失败：
  - 若是非 fast-forward：提示先 `pull --rebase`，或经用户确认后 `--force-with-lease`
  - 若是权限问题：提示检查仓库权限/认证
  - 若是远程分支已存在且含冲突历史：先解释风险，再让用户选处理方式

### 9. 创建 PR / MR

#### 优先方式：使用 `gh` CLI

- 检查 `gh` 是否已安装并登录：`gh auth status`。
- 自动确认以下条件：
  - 当前分支不是基线分支本身
  - 当前分支已经推送到远程，或先推送
  - `git diff <base-branch>...HEAD --stat` 非空
  - 远程平台与 `gh` 能力匹配
- 标题生成规则：
  - 默认使用最近一个 commit subject
  - 若本分支包含多次提交且主题不够概括，可重新生成一个更适合 PR 的标题
- 描述生成规则：
  - 优先读取 `.github/pull_request_template.md`
  - 若不存在，则使用默认模板：
  ```bash
  ## Summary
  - ...
  - ...

  ## Test Plan
  - [ ] ...
  - [ ] ...

  ## Risks
  - ...
  ```
- `base_branch` 默认取远程默认分支；当前仓库通常为 `master`
- 创建 PR 前，若当前分支与基线无差异，直接停止并说明原因。
- 典型命令：
  ```bash
  gh pr create --title "<title>" --body "<body>" --base <base_branch>
  ```

#### 备选方式：生成创建链接

若 `gh` 不可用，解析远程仓库 URL 并生成对应平台的创建链接：

| 平台 | 链接格式 |
|------|----------|
| GitHub | `https://github.com/<owner>/<repo>/pull/new/<branch>` |
| GitLab | `https://<host>/<owner>/<repo>/-/merge_requests/new?merge_request[source_branch]=<branch>` |
| Gitee | `https://gitee.com/<owner>/<repo>/pull/new/<branch>` |
| Codeup | `https://codeup.aliyun.com/<owner>/<repo>/merge_requests/new?source_branch=<branch>` |

**注意**：部分平台支持 URL 参数预填标题和描述，可根据情况生成带参数的链接。

### 10. 收尾与提示

- 输出：
  - commit subject
  - 推送到的分支
  - PR/MR 链接
  - 失败时的明确原因
- 若使用 `gh` 成功，可提供 `gh pr view --web` 作为后续操作。
- 若用户只要求 commit，不要额外创建 PR。

## 交互示例

### 示例 1：当前仓库中“提交并创建 PR”

**用户**：帮我提交 PR

**Skill**：
1. 检查状态 → 当前在 `master`，工作区有 2 个改动文件。
2. 检查最近提交 → 发现仓库主风格是 `emoji + 简短主题`。
3. 询问是否提交全部改动 → 用户确认只提交这 2 个文件。
4. 创建分支 → `feat/optimize-git-commit-pr-skill`
5. 生成提交信息 → `🛠️Refine git commit and PR workflow skill`
6. 暂存并提交。
7. 推送分支。
8. 使用 `gh pr create` 基于 `master` 创建 PR，标题默认取最近 commit subject，正文使用 Summary/Test Plan 模板。

### 示例 2：工作区干净，仅创建 PR

**用户**：帮我发 PR

**Skill**：
1. 检查工作区 → 干净。
2. 检查当前分支 → 已有 3 个本地提交，且尚未创建 PR。
3. 检查远程默认分支 → `master`。
4. 若当前分支未推送，先 `git push -u origin <branch>`。
5. 检查 `git diff master...HEAD --stat` 非空。
6. 使用最近 commit 或归纳后的标题创建 PR。

### 示例 3：只有变更，没有要求建 PR

**用户**：帮我提交一下这些改动

**Skill**：
1. 列出改动文件并询问提交范围。
2. 若当前在 `master/main`，先询问是否需要新建功能分支。
3. 结合仓库提交历史生成推荐 commit subject。
4. 执行：
   ```bash
   git checkout -b feat/some-change
   git add <files>
   git commit -m "🎨Refine some UI or content change"
   ```
5. 不额外创建 PR，除非用户继续要求。

## 错误处理与常见问题

| 场景 | 处理方式 |
|------|----------|
| 不是 git 仓库 | 提示用户 `git init` 或切换到正确目录 |
| 没有远程仓库 | 提示添加 remote，例如 `git remote add origin <url>` |
| 工作区干净且无新增提交 | 不创建空 commit，也不创建空 PR |
| 当前在 `master/main` 且要新增提交 | 优先建议新建分支 |
| 暂存区包含无关文件 | 重新确认范围，只暂存目标文件 |
| 疑似敏感文件被纳入提交 | 先提醒风险，再等待用户确认 |
| pre-commit hook 失败 | 显示错误信息，优先修复后重试；只有用户明确要求才跳过 hook |
| 推送被拒绝（远程有新提交） | 提示先 `git pull --rebase`，或询问是否 `--force-with-lease` |
| 分支名冲突（本地） | 提示覆盖或切换到已有分支 |
| 分支名冲突（远程） | 提示使用不同名称或确认强制推送 |
| `gh` 未登录 | 提示执行 `gh auth login` 后重试 |
| 当前分支尚未 push 就要建 PR | 先推送，再创建 PR |
| 基线分支选择错误风险 | 通过远程默认分支或用户指定值确认 |
| 分支相对基线无差异 | 停止创建 PR，并说明“没有可合并内容” |
| 平台不支持自动链接生成 | 输出手动创建的指导步骤 |

## 最佳实践

- **分支命名**：遵循团队规范，建议使用 `<type>/<description>`，如 `feat/login`。
- **Commit Message**：先观察仓库最近提交，再决定是否使用 emoji 风格或[约定式提交](https://www.conventionalcommits.org/)。对于本仓库，默认优先 `emoji + 简短主题`，不要机械统一成 conventional commits。
- **本仓库推荐模板**：`🎨Refine xxx`、`🔧Fix xxx`、`📝Update xxx`、`✨Add xxx`、`🍭Update Sitemap && AboutMe && Git Svg` 这类短主题优先；若周边历史明显使用 `feat(scope): xxx`，再切换到 conventional 格式。
- **PR 标题**：默认可复用最近 commit subject，但若一个分支有多次提交，PR 标题应更概括，避免只是照搬最后一条 commit。
- **PR 描述**：包含变更内容、测试方法、影响范围、关联 Issue。
- **推送前验证**：尽量在 push 前完成最小必要验证，不要把明显失败留给 CI。
- **及时合并**：PR 创建后主动通知相关 reviewer。

## 扩展能力

- 支持多远程仓库选择：若存在多个远程（如 `origin`、`upstream`），询问推送到哪个。
- 支持自定义 PR 模板：从项目根目录的 `.github/pull_request_template.md` 读取并填充。
- 支持关联 Issue：在 commit 或 PR 描述中自动添加 `Closes #123`。
- 支持自动发布 Release：可选（需额外配置）。

## 限制

- 需具备 `git` 基础环境，`gh` CLI 为可选。
- 无法处理复杂的合并冲突，需用户手动解决。
- 部分私有化 Git 平台可能无法自动生成正确链接，需用户手动创建。
- 若用户未明确授权，不能把“commit / push / PR”当作默认后续动作自动执行。
