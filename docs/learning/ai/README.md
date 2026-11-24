---
title: 免费大模型 API 网关
---

# 免费大模型 API 网关

为方便大家进行 AI 学习与项目开发，社团搭建了 API 网关，现已面向校内同学开放。

🔗 **控制台地址**：<https://ai.ecustcic.com>

## 当前可用模型

| 模型 | 备注 |
|---|---|
| `bge-large-zh:latest` | 嵌入模型 |
| `bge-reranker-v2-m3` | Rerank 模型 |
| `cic-6-astra` | 识图 |
| `cic-model` | 识图 |
| `deepseek-v4-flash` | 0731 版本，上下文 256K |
| `deepseek-v4.1-flash-oc` | 识图 |
| `ernie-5.5-flash-preview` | |
| `glm-4.7` | |
| `glm-5-turbo` | |
| `glm-5.2` | |
| `glm-5.3` | |
| `glm-5.3-flash` | 识图 |
| `google/gemini-3.8-flash` | |
| `gpt-oss-120b` | OpenAI 开源模型，上下文 128K |
| `gte-qwen2:7b` | 嵌入模型，维度 3584，上下文 32K |
| `MiniMax-M2` | |
| `MiniMax-M2.1` | |
| `MiniMax-M2.5` | |
| `MiniMax-M2.5-highspeed` | |
| `MiniMax-M2.7` | 全量版，上下文 256K |
| `MiniMax-M2.7-highspeed` | |
| `MiniMax-M3` | 识图 |
| `MiniMax-M3.1-Flash` | 识图 |
| `qwen3-embedding:8b` | 嵌入模型，维度 4096，上下文 32K |
| `qwen3-reranker:8b` | Rerank 模型，维度 4096，上下文 32K |
| `qwen3.5` | 397B 全量，上下文 128K，支持多模态输入 |
| `qwen3.5-0.8b` | |
| `qwen3.6-35b-a3b` | 识图 |
| `qwen3.8-27b` | 识图 |
| `S1-Base-Lite` | ScienceOne 8B，80 亿参数 |
| `S1-Base-Pro` | ScienceOne 32B，320 亿参数 |
| `S1-Base-Ultra` | ScienceOne 671B，6710 亿参数 |
| `S1-Omni` | 科学多模态统一推理模型，支持蛋白质结合位点与结构预测、小分子/材料性质预测与分类、谱图到分子结构重建、科学图像生成与编辑 |
| `S1-CitationCalculate` | 引用计算服务，用于计算大模型输出结果的引用来源 |
| `wenye-model` | |
| `xing4.0-29b-a4b` | |

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

### DeepSeek Harness

DeepSeek Harness（DSH）是 DeepSeek 推出的终端 Agent 框架。社团为其编写了接入本网关的插件 [dsh-cic](https://cnb.cool/ecustcic/dsh-cic)。

**安装插件：**

```bash
dsh plugin --profile desktop add git+https://cnb.cool/ecustcic/dsh-cic
```

安装后重启 DSH，在设置页的 `dsh-cic` 分区点「登录」，浏览器完成校内统一认证授权即可，无需手动填 API Key。

**更新插件：**

```bash
dsh plugin --profile desktop update dsh-cic
```

**插件功能：**

- **一键接入**：OIDC 授权后自动写入密钥和模型配置，模型选择器即时刷新；回调不通时也可用兑换码或手动粘贴 `sk-gw-` 开头的密钥
- **额度指示**：侧边栏显示「CIC 剩余额度」，点开可看详情
- **模型自动发现**：自动同步网关的 `deepseek` 系列模型，含 `-oc` 后缀模型所需的会话头处理

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

### Reasonix

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
- 可以先使用真实DeepSeek API过配置教程，设置完成后修改配置文件
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

## 网页版 AI 操练场

如果你不想安装任何客户端，可以用社团站点上的 **AI 操练场** 直接对话：

🔗 **地址**：<https://www.ecustcic.com/service/ai-playground>

它完全在浏览器里运行，请求由你的浏览器直接发往网关，配置只保存在本机，不需要登录，也不会经过社团服务器。

**首次使用：**

1. 打开页面，Base URL 已默认填好 `https://ai.ecustcic.com/api/v1`
2. 填入你的 API Key（点右侧眼睛图标可核对）
3. 填入模型名，如 `deepseek-v4-flash`；也可点旁边的按钮从 `/models` 端点拉取可用列表
4. 输入消息开始对话

**通过链接快速配置：**

在页面地址 <https://www.ecustcic.com/service/ai-playground> 后面拼接参数，可以把接入信息直接带进来。支持三个参数（`api` 可省略 `https://`，填到版本根即可，浏览器能正确识别）：

- `?api=ai.ecustcic.com/api/v1`
- `&key=你的API Key`
- `&model=deepseek-v4-flash`（可选）

三个参数依次用 `&` 连接。以社团网关为例，完整地址为
`https://www.ecustcic.com/service/ai-playground?api=ai.ecustcic.com/api/v1&key=你的API Key&model=deepseek-v4-flash`，
粘贴到浏览器地址栏即可打开。

如果 `api` 里需要保留 `https://`，也可以把地址做 URL 编码后再填，效果相同。

| 参数 | 说明 |
|---|---|
| `api` | 接口地址，支持 `api` / `endpoint` / `base` 三种写法，可省略 `https://`，填到版本根即可 |
| `key` | 你的 API Key，支持 `key` / `apikey` / `k` 三种写法 |
| `model` | 可选，模型名称 |

打开后对话区上方会出现提示条，点 **一键导入** 才会写入配置，同时地址栏里的参数会被自动清除。**请不要把带 `key` 的链接分享给他人**，链接本身即等同密钥；页面里的「复制本配置链接」按钮生成的链接不含密钥，适合分享。

**其他功能：**

- **模型筛选**：模型输入框同时作为筛选框，拉取模型列表后输入关键字即可过滤下方列表，点击条目填入模型名
- **图片输入**：直接在输入框粘贴图片会自动开启「图片地址」并转为 Base64，已选图片显示在输入框上方、发送后显示在消息气泡中；也可在左侧「图片地址」里手动添加图片 URL
- **图片限制**：单张不超过 4MB；Base64 图片与配置一起存进浏览器 localStorage（约 5MB 配额），多张大图可能保存失败，长期使用建议改用图片 URL
- **采样参数**：Temperature、Top P、Frequency/Presence Penalty、Max Tokens、Seed，每项都可单独启用或停用
- **调试面板**：点右上角虫子图标，可查看实际发送的请求体与 SSE 事件流，排查接入问题很方便；事件流支持「展开全部」，面板右上角可放大到全屏查看
- **导出导入**：对话与配置可导出为 JSON 备份，或分享给他人

## 常见问题

### 提示认证失败

- 检查 API Key 是否正确
- 确认已完成在校状态验证并重新同步 OIDC

### 提示模型不可用

- 确认已完成在校状态验证，未验证只能使用部分模型
- 检查模型名称是否正确（`deepseek-v4-flash` / `deepseek-v4-pro`）

### 请求频率超限

- 每个账号每小时最多 100 次请求，请稍后重试
