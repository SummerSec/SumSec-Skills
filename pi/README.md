# Pi coding agent 适配

本仓库是一个 [Pi](https://pi.dev) package。根 `package.json` 的 `pi.skills` 直接挂载各插件真实的 `<plugin>/skills/` 目录，不复制 Skill 树，也不把根目录 `skills/` symlink 聚合入口写进 manifest（Pi glob 不会继续穿越 symlink）。

官方文档：[Pi Packages](https://pi.dev/docs/latest/packages)、[Skills](https://github.com/earendil-works/pi/blob/main/packages/coding-agent/docs/skills.md)。

当前入口只声明 Skill 根，不注册 Pi extension、prompt template 或 theme。

## 本仓库 checkout

已提交 [`.pi/settings.json`](../.pi/settings.json)，`packages` 为 `[".."]`：相对该 settings 文件解析后指向仓库根，因此会读取根 `package.json` 的 `pi` manifest。

项目被 Pi 信任后，在仓库根启动 `pi` 即可加载九个插件 Skill 根。单次运行可用 `pi --approve` 信任项目文件。不要再执行 `pi install -l .`：相对路径相对 `.pi/settings.json` 解析，`.` 会指向 `.pi/` 而不是仓库根。

## 安装到其他项目

用户级（写入 `~/.pi/agent/settings.json`）：

```bash
pi install git:github.com/SummerSec/SumSec-Skills
pi install https://github.com/SummerSec/SumSec-Skills
```

项目级（写入目标项目的 `.pi/settings.json`）：把本地 checkout 的**绝对路径**传给 `pi install -l`，或使用 git 源：

```bash
pi install -l /absolute/path/to/SumSec-Skills
pi install -l git:github.com/SummerSec/SumSec-Skills
```

当前会话试加载、不写入 settings：

```bash
pi -e git:github.com/SummerSec/SumSec-Skills
```

Git 安装会 clone 仓库并执行 `npm install`。本仓 `postinstall` 在 Pi 进程内会跳过 submodule 同步；各插件目录里的 `SKILL.md` 已提交，发现不依赖这次同步。

本包尚未作为 npm `pi-package` 发布时，不要使用 `pi install npm:sumsec-skills`。`keywords` 已包含 `pi-package`，发布到 npm 后才会进入 [pi.dev/packages](https://pi.dev/packages)。

## 验证

```bash
npm run validate:pi
```

核对 `package.json` 的 `pi.skills`、`.pi/settings.json` 的本地 package 指针，以及九个插件根下至少各有一个一层 `SKILL.md`。

新增或删除插件 Skill 根时，同步更新 `scripts/plugin-skill-roots.mjs`、根 `package.json` 的 `pi.skills`、`scripts/validate-pi.mjs`、本文和 DSH mount 清单。
