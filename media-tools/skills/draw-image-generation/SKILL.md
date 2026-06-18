---
name: draw-image-generation
description: >
  Use when the user wants to generate, create, or draw images using AI;
  mentions text-to-image, AI drawing, image generation, 画图, 生成图片,
  AI 绘画, or needs visual content from text descriptions.
  Supports any OpenAI-compatible image API (OpenAI, Azure, Right.Codes, etc.).
  Requires OPENAI_API_KEY or GPT_API_TOKEN environment variable.
disable-model-invocation: true
---

# Draw Image Generation：AI 图片生成

调用 OpenAI 兼容的 `/v1/images/generations` 端点生成图片。支持官方 OpenAI、Azure OpenAI、Right.Codes 及任意兼容代理。

## 前置条件

执行前确认 API Key 环境变量已设置（二选一）：

| 变量 | 说明 |
|------|------|
| `OPENAI_API_KEY` | 优先读取，通用 OpenAI 密钥 |
| `GPT_API_TOKEN` | 兼容旧配置，作为 fallback |

可选配置 Base URL（不设则默认 Right.Codes）：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `OPENAI_BASE_URL` | API 基础地址 | `https://www.right.codes/draw` |

若未设置 API Key，只问用户一句：

> 需要 API Key，请设置环境变量：
> `export OPENAI_API_KEY='sk-...'`（Bash）或 `$env:OPENAI_API_KEY = 'sk-...'`（PowerShell）。

## 执行步骤（Agent 照做）

1. **确认 API Key**：检查 `OPENAI_API_KEY` 或 `GPT_API_TOKEN`，未设置则按上节提示询问用户
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

# 使用官方 OpenAI DALL-E 3
python "${CLAUDE_SKILL_DIR}/scripts/generate_image.py" \
  "A serene mountain lake at sunrise" \
  --model dall-e-3 --quality hd --style natural \
  --base-url https://api.openai.com

# 生成多张图片
python "${CLAUDE_SKILL_DIR}/scripts/generate_image.py" \
  "A cute cat wearing a wizard hat" -n 4

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

# 使用自定义端点
python "${CLAUDE_SKILL_DIR}/scripts/generate_image.py" \
  "Abstract geometric art" \
  --base-url https://my-proxy.example.com
```

## 参数一览

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `prompt`（位置参数） | 图片描述提示词（中英文均可） | 必填 |
| `--model` | 图片生成模型 | `gpt-image-2` |
| `--size` | 输出尺寸 | `1024x1024` |
| `-n` | 生成图片数量 | `1` |
| `--quality` | 图片质量：`auto`/`low`/`medium`/`high`/`hd`/`standard` | 无（由模型决定） |
| `--style` | 图片风格：`vivid`/`natural`（DALL-E 3） | 无 |
| `--image` | 参考图路径或 URL（可重复） | 无 |
| `--output` / `-o` | 下载图片到指定路径 | 无（仅输出 URL） |
| `--json` | 输出完整 JSON 响应 | 否 |
| `--response-format` | `url` 或 `b64_json` | `url` |
| `--base-url` | 覆盖 API 基础地址 | 取环境变量或默认值 |

## 端点兼容性

| 提供商 | Base URL | 模型 |
|--------|----------|------|
| Right.Codes（默认） | `https://www.right.codes/draw` | `gpt-image-2` |
| OpenAI 官方 | `https://api.openai.com` | `dall-e-2`, `dall-e-3`, `gpt-image-1` |
| Azure OpenAI | `https://{resource}.openai.azure.com` | 按部署名 |
| 其他代理 | 自定义 | 视代理支持 |

## API 参考

| 项目 | 值 |
|------|-----|
| **Method** | `POST` |
| **Endpoint** | `{base_url}/v1/images/generations` |
| **Headers** | `Authorization: Bearer <api-key>`, `Content-Type: application/json` |

### 请求体

| 字段 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `model` | 是 | string | 模型名，如 `gpt-image-2`、`dall-e-3` |
| `prompt` | 是 | string | 图片描述 |
| `n` | 否 | int | 生成数量（1-10，模型相关） |
| `size` | 否 | string | 如 `1024x1024`、`1792x1024`、`1024x1792` |
| `quality` | 否 | string | 图片质量等级 |
| `style` | 否 | string | `vivid` 或 `natural` |
| `image` | 否 | string[] | 参考图 base64 或 URL |
| `response_format` | 否 | string | `url` 返回直链；`b64_json` 返回 base64 |

### 成功响应

```json
{
  "data": [{ "url": "https://..." }],
  "usage": { "total_tokens": 6267 }
}
```

## 备选：curl 直调

若 Python / requests 不可用，用 curl 替代：

```bash
curl -X POST "${OPENAI_BASE_URL:-https://www.right.codes/draw}/v1/images/generations" \
  -H "Authorization: Bearer ${OPENAI_API_KEY:-$GPT_API_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"model":"gpt-image-2","prompt":"一只边牧与古牧正在抖音直播间直播带货","size":"1024x1024","n":1,"response_format":"url"}'
```

## 常见问题

| 问题 | 原因 | 解决 |
|------|------|------|
| 401 Unauthorized | API Key 缺失或错误 | 检查 `OPENAI_API_KEY` 或 `GPT_API_TOKEN` |
| 400 Bad Request | 缺少 `model` 或 `prompt` | 两个均为必填字段 |
| 400 参数不支持 | 端点不支持 `quality`/`style`/`n` | 部分参数仅特定模型支持，去掉不兼容参数 |
| URL 404 | 路径错误 | 确认 base URL 是否需要路径前缀（如 Right.Codes 需要 `/draw`） |
| `requests` 未安装 | 缺少依赖 | `pip install requests` |
