---
title: 免费大模型 API 网关
---

# 免费大模型 API 网关

为方便大家进行 AI 学习与项目开发，社团搭建了 API 网关，现已面向校内同学开放。

🔗 **控制台地址**：<https://ai.ecustcic.com>

## 当前可用模型

| 模型 | 说明 |
|---|---|
| DeepSeek-V4-Flash | 响应快，适合日常问答和轻量任务 |
| DeepSeek-V4-Pro | 性能更强，适合复杂任务 |

> 后续会视情况增加更多模型。

## 使用方法

1. 浏览器打开 [控制台](https://ai.ecustcic.com)，通过**校内统一认证**登录
2. 获取你的专属 API Key
3. 参照下方[工具配置教程](#工具配置教程)将 Key 配置到代码或工具中即可调用

## 请求限制

每个账号每小时最多 100 次请求，请合理使用，避免影响他人。

## 注意事项

- 本服务仅限校内人员，请勿将 API Key 分享给校外人员
- 有问题或建议，欢迎在社团群内反馈
- 在校状态理论上会在自助注册时自动验证，如早期注册皮肤站用户需要在这里验证：<https://mcskin.ecustvr.top/user/campus-status>

## 在校状态验证

为确保资源合理使用，**仅验证在校状态后，才可解锁并使用全部模型功能**。请严格按照以下步骤操作：

1. **点击链接完成在校状态验证**
   👉 <https://mcskin.ecustvr.top/user/campus-status>
   （请确保已接入校园网络或使用校内 VPN 或使用学号邮箱登录）

2. **重新同步 OIDC**
   验证成功后，**必须重新同步 OIDC**，否则权限无法生效。
   操作路径：在左侧菜单栏中，点击 **"同步 OIDC"** 按钮。

::: warning 重要提示
- 验证状态有**有效期**，过期后需重复上述步骤。
- 如遇验证失败，请检查网络是否为校内环境，或联系管理员。
:::

## API 端点

| 接口 | 地址 |
|---|---|
| Chat Completions (OpenAI) | `https://ai.ecustcic.com/api/v1/chat/completions` |
| Chat (Ollama) | `https://ai.ecustcic.com/api/ollama/api/chat` |
| Responses (OpenAI) | `https://ai.ecustcic.com/api/v1/responses` |
| Messages (Anthropic Claude) | `https://ai.ecustcic.com/api/v1/messages` |
| Embeddings (OpenAI) | `https://ai.ecustcic.com/api/v1/embeddings` |

> 使用 OpenAI 兼容格式的工具，Base URL 填 `https://ai.ecustcic.com/api/v1`。

## 工具配置教程

### 自动配置工具

[Eric](https://github.com/ericzhang-debug) 提供了一个自动配置工具 [cic-ai-config-helper](https://github.com/ericzhang-debug/cic-ai-config-helper)，可以快速配置环境变量：

```bash
npx cic-ai-config-helper
```

运行后按提示操作即可。如果自动工具不支持你使用的工具，请参考下面的手动配置方法。

### Claude Code

Claude Code 是 Anthropic 推出的 AI 编程助手命令行工具。

编辑配置文件 `~/.claude/settings.json`（如不存在则创建）：

```json
{
  "env": {
    "ANTHROPIC_API_KEY": "你的API Key",
    "ANTHROPIC_BASE_URL": "https://ai.ecustcic.com/api",
    "ANTHROPIC_MODEL": "deepseek-v4-flash"
  }
}
```

::: tip 说明
- `ANTHROPIC_BASE_URL` 填写到 `/api` 即可，Claude Code 会自动拼接 `/v1/messages`
- 如果需要使用性能更强的模型，将 `ANTHROPIC_MODEL` 改为 `deepseek-v4-pro` 或 `deepseek-v4-pro[1m]`
- 也可以在 Claude Code 中通过 `/model` 命令切换模型
:::

### Reasonix Code

Reasonix 是一款以 DeepSeek 为原生后端的终端编程 Agent。设计围绕 DeepSeek API 展开 —— Cache-First 循环、Flash 优先的成本控制、工具调用自动修复。

编辑配置文件 `~/.reasonix/config.json`（如不存在则创建）：

```json
{
  "lang": "zh-CN",
  "baseUrl": "https://ai.ecustcic.com/api/v1",
  "apiKey": "你的API Key",
  "theme": "dark",
  "mcp": [],
  "model": "deepseek-v4-flash"
}
```

::: tip 说明
- `baseUrl` 填写 `https://ai.ecustcic.com/api/v1`
- 如果需要使用性能更强的模型，将 `model` 改为 `deepseek-v4-pro`
:::

### OpenAI Codex CLI

OpenAI Codex CLI 是 OpenAI 推出的命令行 AI 编程工具。

设置环境变量：

**Linux / macOS：**

```bash
export OPENAI_API_KEY="你的API Key"
export OPENAI_BASE_URL="https://ai.ecustcic.com/api/v1"
```

建议将以上内容添加到 `~/.bashrc` 或 `~/.zshrc` 中。

**Windows PowerShell：**

```powershell
$env:OPENAI_API_KEY = "你的API Key"
$env:OPENAI_BASE_URL = "https://ai.ecustcic.com/api/v1"
```

建议将以上内容添加到 `$PROFILE` 中。

### Cursor

Cursor 是一款 AI 驱动的代码编辑器。

1. 打开 Cursor，进入 **Settings → Models**
2. 在 **OpenAI API Key** 中填入你的 API Key
3. 点击 **Add model**，添加模型名称，如 `deepseek-v4-flash` 或 `deepseek-v4-pro`
4. 在 **Override OpenAI Base URL** 中填入 `https://ai.ecustcic.com/api/v1`
5. 选择添加的模型即可使用

### ChatBox

ChatBox 是一款跨平台 AI 聊天客户端。

1. 打开 ChatBox，进入 **设置**
2. 选择 **添加自定义服务（OpenAI API 兼容）**
3. 填写：
   - **API Host**：`https://ai.ecustcic.com/api`
   - **API Key**：你的 API Key
   - **模型**：`deepseek-v4-flash` 或 `deepseek-v4-pro`
4. 保存即可使用

### Python 代码调用

如果你在代码中直接调用 API，可以使用 OpenAI 的 Python SDK：

```bash
pip install openai
```

```python
from openai import OpenAI

client = OpenAI(
    api_key="你的API Key",
    base_url="https://ai.ecustcic.com/api/v1"
)

response = client.chat.completions.create(
    model="deepseek-v4-flash",
    messages=[
        {"role": "user", "content": "你好"}
    ]
)

print(response.choices[0].message.content)
```

### curl 调用

```bash
curl https://ai.ecustcic.com/api/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer 你的API Key" \
  -d '{
    "model": "deepseek-v4-flash",
    "messages": [{"role": "user", "content": "你好"}]
  }'
```

## 常见问题

### 提示认证失败

- 检查 API Key 是否正确
- 确认已完成在校状态验证并重新同步 OIDC

### 提示模型不可用

- 确认已完成在校状态验证，未验证只能使用部分模型
- 检查模型名称是否正确（`deepseek-v4-flash` / `deepseek-v4-pro`）

### 请求频率超限

- 每个账号每小时最多 100 次请求，请稍后重试
