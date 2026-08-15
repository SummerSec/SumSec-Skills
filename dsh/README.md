# DeepSeek Harness 适配

本仓库是一个 DeepSeek Harness（DSH）profile bundle。根 `package.json` 通过 `dsh.bundle.patch` 声明 [`cordis.patch.yml`](cordis.patch.yml)，由官方 `@deepseek-ai/dsh-skill-filesystem` 直接扫描各插件真实的 `<plugin>/skills/` 目录，不复制 Skill 树，也不依赖 Git symlink checkout 行为。

当前适配按 `@deepseek-ai/dsh@0.1.0-rc.6` 验证。DSH 仍是 prerelease，后续版本若调整 profile 或 Cordis patch contract，应先重新运行 `npm run validate:dsh` 并核对官方包。

## 仓库本地临时加载

在本仓库根目录执行：

```bash
dsh --profile headless --patch ./dsh/cordis.patch.yml "使用合适的 SumSec Skill 检查当前项目"
```

`--patch` 是一次性 overlay，不会修改 profile。patch 中的路径通过 patch 文件的 `baseUrl` 解析，因此从其他工作目录启动 DSH 也不依赖当前目录拼接 Skill 路径。

可先只检查组合结果：

```bash
dsh --profile headless --patch ./dsh/cordis.patch.yml --dump-config
```

## 持久启用为 profile bundle

先安装 bundle 包。根包已有用于仓库维护的 Python `postinstall`，DSH 只需要提交在仓库中的同步结果，因此安装时禁用生命周期脚本：

```bash
# 在 SumSec-Skills checkout 根目录执行；相对路径由 dsh 固定到调用目录
dsh plugin --profile headless add --workspace-root --ignore-scripts .
```

也可直接安装 Git 版本：

```bash
dsh plugin --profile headless add --workspace-root --ignore-scripts https://github.com/SummerSec/SumSec-Skills.git
```

`--workspace-root` 明确允许 pnpm 修改 profile workspace 根依赖；缺少它时，pnpm 9 会以 `ERR_PNPM_ADDING_TO_ROOT` 拒绝安装。

然后编辑 `$DSH_HOME/profiles/headless/package.json`（未设置 `DSH_HOME` 时默认为 `~/.dsh/profiles/headless/package.json`），把包名 `sumsec-skills` 追加到现有 `dsh.profile.bundles` 末尾：

```json
{
  "dsh": {
    "profile": {
      "bundles": [
        "@deepseek-ai/dsh-base",
        "@deepseek-ai/dsh-headless",
        "sumsec-skills"
      ]
    }
  }
}
```

保留 profile 中已有的其他字段和 bundle 顺序，只追加 `sumsec-skills`。`dsh plugin --profile ... add ...` 在这里仅用于安装依赖；不要依赖它替你写入 `dsh.profile.bundles`。

验证 profile 已组合该层：

```bash
dsh --profile headless --dump-default-config
dsh --profile headless "列出当前可用的 SumSec Skills"
```

默认的项目 `.dsh/skills`、项目 `.agents/skills`、`$DSH_HOME/skills` 和 `~/.agents/skills` 仍会参与发现；SumSec-Skills 的九个插件目录作为 custom roots 加入。
