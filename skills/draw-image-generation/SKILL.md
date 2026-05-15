---
name: draw-image-generation
description: >
  Use when the user wants to generate, create, or draw images using AI;
  mentions text-to-image, AI drawing, image generation, 画图, 生成图片,
  AI 绘画, or needs visual content from text descriptions.
  Requires GPT_API_TOKEN environment variable.
disable-model-invocation: true
---

# Draw Image Generation：AI 图片生成

调用 Right.Codes `/v1/images/generations`（OpenAI Images API 兼容格式）生成图片。

## 前置条件

执行前确认 `GPT_API_TOKEN` 环境变量已设置。若未设置，只问用户一句：

> 需要 Right.Codes API Key，请设置环境变量 `GPT_API_TOKEN`。
> `$env:GPT_API_TOKEN = 'sk-...'`（PowerShell）或 `export GPT_API_TOKEN='sk-...'`（Bash）。

## 执行步骤（Agent 照做）

1. **确认 API Key**：检查 `GPT_API_TOKEN`，未设置则按上节提示询问用户
2. **确认参数**：若用户未指定 model / size，默认 `gpt-image-2` + `1024x1024`
3. **调用脚本**：优先用 `${CLAUDE_SKILL_DIR}/scripts/generate_image.py`
4. **返回结果**：输出图片 URL；询问用户是否需要 `--output` 下载到本地

## 脚本用法

```bash
# 基础文生图（输出直链）
python "${CLAUDE_SKILL_DIR}/scripts/generate_image.py" "一只柴犬在草地上奔跑"

# 指定尺寸 + 模型
python "${CLAUDE_SKILL_DIR}/scripts/generate_image.py" \
  "Cyberpunk city skyline at night, neon lights" \
  --size 1792x1024 --model gpt-image-2

# 带参考图（本地文件或 URL）
python "${CLAUDE_SKILL_DIR}/scripts/generate_image.py" \
  "Transform into oil painting style" \
  --image reference.png

# 下载到本地
python "${CLAUDE_SKILL_DIR}/scripts/generate_image.py" \
  "A serene mountain lake at sunrise" \
  --output landscape.png

# 输出完整 JSON（含 usage）
python "${CLAUDE_SKILL_DIR}/scripts/generate_image.py" \
  "A cute cat wearing a wizard hat" --json
```

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `prompt`（位置参数） | 图片描述提示词（中英文均可） | 必填 |
| `--model` | 图片生成模型 | `gpt-image-2` |
| `--size` | 输出尺寸 | `1024x1024` |
| `--image` | 参考图路径或 URL（可重复） | 无 |
| `--output` / `-o` | 下载图片到指定路径 | 无（仅输出 URL） |
| `--json` | 输出完整 JSON 响应 | 否 |
| `--response-format` | `url` 或 `b64_json` | `url` |

## API 参考

| 项目 | 值 |
|------|-----|
| **Method** | `POST` |
| **Base URL** | `https://www.right.codes/draw` |
| **Endpoint** | `/v1/images/generations` |
| **Headers** | `Authorization: Bearer <api-key>`, `Content-Type: application/json` |

### 请求体

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `model` | 是 | string | 模型名，如 `gpt-image-2` |
| `prompt` | 是 | string | 图片描述 |
| `image` | 否 | string[] | 参考图 base64（`data:image/...;base64,...`）或 URL |
| `size` | 否 | string | 如 `1024x1024`、`1792x1024`、`1024x1792` |
| `response_format` | 否 | string | `url` 返回直链；默认 base64 |

### 成功响应

```json
{
  "data": [{ "url": "https://file4.aitohumanize.com/file/xxx.png" }],
  "usage": { "total_tokens": 6267 }
}
```

## 备选：curl 直调

若 Python / requests 不可用，用 curl 替代：

```bash
curl -X POST "https://www.right.codes/draw/v1/images/generations" `
  -H "Authorization: Bearer $env:GPT_API_TOKEN" `
  -H "Content-Type: application/json" `
  -d '{"model":"gpt-image-2","prompt":"一只边牧与古牧正在抖音直播间直播带货","size":"1024x1024","response_format":"url"}'
```

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 401 Unauthorized | API Key 缺失或错误 | 检查 `GPT_API_TOKEN` |
| 400 Bad Request | 缺少 `model` 或 `prompt` | 两个均为必填字段 |
| URL 404 | 漏了 `/draw` 路径前缀 | 完整 URL 为 `https://www.right.codes/draw/v1/images/generations` |
| `requests` 未安装 | 缺少依赖 | `pip install requests` |
