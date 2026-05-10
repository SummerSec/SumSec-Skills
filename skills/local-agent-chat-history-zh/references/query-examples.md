# 按日期查询示例

以下示例假设目标日为 **2026-05-10**，请替换为实际需要。时间边界建议：**本地时区当天 00:00:00 至 23:59:59**。

## 1. 按文件修改日期粗筛（PowerShell）

```powershell
$d = Get-Date '2026-05-10'
$root = "$env:USERPROFILE\.claude\projects"
Get-ChildItem -Path $root -Recurse -File -Filter *.jsonl -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime.Date -eq $d.Date } |
  Select-Object FullName, LastWriteTime
```

对 Codex `history.jsonl`：单行带 `ts` 时，文件 `LastWriteTime` 可能总在变，**不能**仅靠文件日期；请用下一节。

## 2. Codex `history.jsonl` 按行内 `ts`（PowerShell）

```powershell
$day = [DateTime]'2026-05-10'
$start = [int][double]::Parse(([DateTimeOffset]$day).ToUnixTimeSeconds())
$end   = [int][double]::Parse(([DateTimeOffset]$day.AddDays(1)).ToUnixTimeSeconds())
$path  = "$env:USERPROFILE\.codex\history.jsonl"
Get-Content $path -ErrorAction SilentlyContinue | ForEach-Object {
  try {
    $o = $_ | ConvertFrom-Json
    if ($o.ts -ge $start -and $o.ts -lt $end) { $_ }
  } catch {}
}
```

若字段名不是 `ts`，以实际 JSON 为准用 `ConvertFrom-Json` 后取对应属性。

## 3. Cursor：`state.vscdb`（需本机已安装 `sqlite3`）

列出可能含聊天数据的 key（示例，实际 key 因版本而异）：

```bash
sqlite3 "/path/to/state.vscdb" "SELECT key FROM ItemTable WHERE key LIKE '%chat%' OR key LIKE '%composer%' LIMIT 50;"
```

读出某 key 的值（可能为 JSON 文本，体积大）：

```bash
sqlite3 "/path/to/state.vscdb" "SELECT value FROM ItemTable WHERE key = 'workbench.panel.aichat.view.aichat.chatdata' LIMIT 1;"
```

再在 JSON 内按时间字段筛选；若结构复杂，建议用户用 **DB Browser for SQLite** 本地打开，避免整段粘贴进聊天。

## 4. 按工作区缩小 Cursor 范围

若已知项目曾在路径 `D:\ghproject\MyRepo` 打开，可先在该日修改过的工作区目录中，用资源管理器按**修改日期**排序 `workspaceStorage` 子文件夹，缩小候选 `state.vscdb` 数量，再对少数库执行 SQL。

## 5. Claude Code 项目下 JSONL

若行内带 ISO 时间或 `created_at` 类字段，可用类似 Codex 的逐行 `ConvertFrom-Json` 过滤；若仅为追加日志且无统一时间字段，则依赖文件 `LastWriteTime` 或让用户在编辑器中打开该会话文件人工浏览。
