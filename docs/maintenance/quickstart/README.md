---
title: 本站维护快速入门指南
---

# 本站维护快速入门指南

## 关于本站

本站由主站和技术文档子站两部分组成：

- **主站**：基于 Vue.js 2 + Bootstrap 4 构建，提供协会介绍、活动公告、电竞赛事、交流群等内容
- **技术文档子站**：基于 VuePress 1.x 构建，提供课程攻略、网络 FAQ、开发教程、维护指南等文档内容，部署在 `/tech/` 路径下

## 技术文档子站结构

技术文档源文件位于 `docs/` 目录：

```
docs/
├── .vuepress/
│   ├── config.js        # VuePress 配置（侧边栏等）
│   ├── enhanceApp.js    # 应用增强（修复返回主站链接等）
│   ├── styles/
│   │   └── index.styl   # 全局样式覆盖
│   └── public/
│       ├── favicon.ico
│       └── logo-cic.png # 左上角 logo
├── learning/
│   ├── ecust-CourseShare/  # 课程攻略共享计划
│   ├── library/            # 图书数据库使用方法
│   ├── ai/                 # 免费大模型 API 网关使用指南
│   └── nic/                # NIC 域名分发系统使用指南
├── faq/                    # 网络信息服务 FAQ
├── dev/
│   └── EcustMakerTurtorial/  # 游戏开发路径指南
├── maintenance/
│   └── quickstart/          # 本指南
└── README.md              # 文档首页
```

## 修改文档内容

1. 编辑 `docs/` 下对应的 Markdown 文件
2. 预览：`npm run docs:dev`
3. 构建并同步到主站：`npm run docs:build`
4. 验证主站效果：`npm run serve`，访问 `http://localhost:8080/tech/`

## 添加新文档页面

1. 在 `docs/` 对应目录下创建 Markdown 文件
2. 在 `docs/.vuepress/config.js` 的 `sidebar` 中添加条目
3. 构建并验证

## 修改侧边栏

编辑 `docs/.vuepress/config.js` 中的 `sidebar` 配置。当前所有板块合并为统一大目录，任何页面都能看到完整的左侧导航。

## 构建后处理

`npm run docs:build` 会自动运行 `scripts/docs-postbuild.js`，执行以下操作：

- 为目录式页面创建 `.html` 副本（兼容两种 URL 格式）
- 修复"返回主站"和 logo 链接（将 `/tech/` 替换为 `/`，避免硬编码域名）
- 将构建产物同步到 `public/tech/`

## 项目仓库

- CNB：[https://cnb.cool/ecustcic/ecustcic-web](https://cnb.cool/ecustcic/ecustcic-web)（主仓库）
- GitHub：[https://github.com/ECUSTCIC-CodeHub/ecustcic-web](https://github.com/ECUSTCIC-CodeHub/ecustcic-web)（镜像）

> ⚠️ 修改请提交至 CNB 或 GitHub 仓库，Gitcode、Gitee 等镜像仓库仅用于自动同步，请勿直接修改。

## 后端函数与内容管理

主站的活动 / 快讯 / 图片存储由 EdgeOne Pages 的函数提供，仓库里对应两个目录：

```
cloud-functions/                # Node.js Cloud Functions
└── api/
    ├── auth/[[action]].js      # Blessing Skin OAuth 登录、会话与短时管理令牌
    ├── activity-image.js       # 图片上传与读取（Blob）
    └── storage.js              # 图片列表与删除（服务端校验引用）
edge-functions/                 # V8 Edge Functions
└── api/activity/[action].js    # 活动 / 快讯读写（KV）
```

后台入口 `/admin`，需要 ECUSTMC 皮肤站账号且 `permission >= 1`。流程是：皮肤站登录 → 会话 Cookie → `/api/auth/token` 兑换 2 小时管理令牌 → 发布内容、上传图片。

- 前台：`/activities` 活动回顾、`/news` 快讯、`/activity/:id` 详情，首页顶部展示最新条目
- 数据：Edge Function + KV（控制台绑定变量名 `activities_kv`，数据存在 `activities:list`）
- 图片：Cloud Function + Blob 存储（store 名 `activity-covers`，只允许 `covers/` 前缀）

管理令牌有两种：

1. 后台页面通过 `/api/auth/token` 用登录会话兑换的 **2 小时短期令牌**（默认路径，只存在浏览器内存里）
2. 控制台配置的 `MACHINE_TOKEN` 机器凭证（仅供脚本 / CI 直接调用写接口，不下发浏览器）

#### 接口一览

| 方法 | 路径 | 鉴权 |
|---|---|---|
| GET | `/api/activity/all`（`?kind=` `?limit=`） | 公开 |
| GET | `/api/activity/all?includeHidden=1` | 管理令牌（未授权返回 401，不会降级成公开列表） |
| GET | `/api/activity/detail?id=` | 公开（草稿需管理令牌） |
| POST | `/api/activity/all` | 管理令牌 |
| DELETE | `/api/activity/detail?id=` | 管理令牌 |
| GET | `/api/activity-image?key=covers/...` | 公开 |
| POST | `/api/activity-image` | 管理令牌 |
| GET / DELETE | `/api/storage` | 管理令牌 |
| POST | `/api/ai-detect` | 登录会话（未登录返回 401） |
| GET | `/api/auth/login`、`/callback`、`/me`、`/token`、`/logout` | 会话 Cookie |

`/api/auth/login` 支持 `?redirect=<站内路径>`：登录成功后 302 跳回该路径（必须是 `/` 开头的站内相对路径，非法或缺省时跳 `/user/info`），用于实现"从哪个页面去登录就回到哪个页面"。

#### 修改电竞热门游戏数据

编辑 `/src/data/esportsGames.js` 文件（电竞荣誉数据在 `esportsHonors.js`）。

#### 交流群信息

交流群列表由飞书多维表格提供（`/e-sports/detail` 页面读取），添加新群或更新群信息请提交[官方表单](https://ecustcic.feishu.cn/share/base/form/shrcn5SJVIvKbkfDZxQsn0djtng)。新群信息需人工审核，非实时同步到网站。

#### AI 检测助手

服务工具箱中的「AI 检测助手」（`/service/ai-detect`）用于判断文本是否由 AI 生成，**必须登录后使用**。

- 前端：`src/views/Service/AiDetect.vue`，入口在 `/service` 工具箱
- 后端：`POST /api/ai-detect`，校验 `cic_session` 登录会话后转发到 EdgeOne Makers 内置模型 `@makers/zhuque-text`
- 密钥：在 EdgeOne 控制台 **Makers - Models - API Key** 创建，配置为环境变量 `MAKERS_MODELS_KEY`；密钥只存在服务端，不下发浏览器
- 限制：单次最多 5000 字；模型调用计入 Makers 每月免费额度
- 结果仅供参考：接口返回整体置信度、人工 / 疑似 AI / AI 三档占比，以及（不合并段落时）逐段标签

### 环境变量（EdgeOne Pages 控制台）

| 变量 | 必填 | 说明 |
|---|---|---|
| `OAUTH_STATE_SECRET` | 是 | 会话与管理令牌的签名密钥，随机长字符串。缺失时 `/api/auth/*` 直接 500；**更换后所有人需重新登录** |
| `SITE_URL` | 是 | 本站对外地址，如 `https://www.ecustcic.com`（必须 https，结尾不带斜杠）。用于拼 OAuth 回调地址、CORS 白名单与删除图片前的回源校验，不配则无法登录 |
| `BS_CLIENT_ID` | 是 | Blessing Skin OAuth 客户端 ID |
| `BS_CLIENT_SECRET` | 是 | Blessing Skin OAuth 客户端 Secret |
| `BS_BASE_URL` | 是 | 皮肤站地址，如 `https://mcskin.ecustvr.top` |
| `BS_OAUTH_SCOPE` | 否 | 默认 `User.Read`；设为空字符串表示不传 scope |
| `MACHINE_TOKEN` | 否 | 机器凭证，仅供 curl / CI 直接调用写接口，不下发浏览器 |
| `MAKERS_MODELS_KEY` | 否（AI 检测助手必填） | EdgeOne Makers 内置模型 API Key，用于调用朱雀文本检测；未配置时 `/api/ai-detect` 返回 500 |

> 旧的 `ADMIN_TOKEN` 已废弃：它曾由 `/api/auth/token` 明文返回给浏览器，历史值应视为已泄露。升级后请从控制台删除该变量，需要脚本化写入时改用新生成的 `MACHINE_TOKEN`。

控制台一次性配置：

- KV 存储：创建命名空间并绑定为全局变量 `activities_kv`
- Blob 存储：函数内使用 `activity-covers`，无需额外创建

### 维护时的注意事项

- 正文为 Markdown，前台由 `mavon-editor` 渲染，其内置 FilterXSS 负责过滤 HTML。更换渲染方式时必须接入等价的白名单清洗（DOMPurify / FilterXSS），不要直接 `v-html`
- 图片被任意活动/快讯引用时，服务端会拒绝删除；引用校验失败会直接取消删除而不是放行
- 管理员令牌 2 小时过期，后台操作会自动重新兑换；皮肤站 access_token 失效后需要重新登录
- 手动 `edgeone pages deploy ./dist` 前务必重新执行 `npm run build`（含函数副本）；推送 `master` 的 CI 会自动构建，无需手动

## 部署

生产环境由 EdgeOne Pages 托管。推送 `master` 后，`.cnb.yml` 在 Node 22 容器内安装 EdgeOne CLI，再执行 `edgeone pages deploy -n ecustcic`；CLI 读取 `edgeone.json`，自动执行 `npm install` 与 `npm run build:edge`，并从仓库根目录的 `edge-functions/`、`cloud-functions/` 打包两类函数一起部署。

`npm run build:edge`（CI 使用）生成：

```
dist/
├── index.html           # 主站入口
├── tech/                # 技术文档（VuePress 产物）
└── js/ css/ ...         # 主站静态资源
```

函数不复制进 `dist`，避免源码被当作静态资源公开。需要手动 `edgeone pages deploy ./dist` 时改用 `npm run build`，它会把 `edge-functions/`、`cloud-functions/` 和只含 `@edgeone/pages-blob` 的极简 `package.json` 复制进 `dist`。

注意：

- **CI 使用自动构建**：函数由 CLI 从仓库根目录读取，`dist` 只放静态资源；手动只传 `./dist` 时必须先执行 `npm run build`（含函数副本），否则 `/api/*` 会 404
- **不要删除 `edgeone.json`**：它定义了 `npm run build:edge`、输出目录，以及 `/* → /index.html` 的 SPA 深链回退（否则 `/user/info` 等直接访问会 404）；手动只传 `./dist` 时 rewrites 不生效（实测），因此 CI 保持自动构建模式
- 未注册的 `/api/*` 会被 SPA 回退接管并返回 HTML（平台行为）；排查接口问题时请直接请求具体路径
- 只做纯静态托管（Nginx / GitHub Pages）时页面可正常浏览，但没有 `/api/*`，后台管理与动态内容不可用

### 纯静态托管（可选）

若不使用 EdgeOne Pages，把 `dist/` 的静态部分放进 Web 服务器即可：

- 主站使用 HTML5 History Mode，需把所有非文件请求回退到 `index.html`
- `/tech/` 下是纯静态文件，不需要回退

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ecustcic-web;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /tech/ {
        try_files $uri $uri/ =404;
    }
}
```

注意：主站构建使用 Node.js 22。本地构建如遇 OpenSSL 报错，可临时设置 `NODE_OPTIONS=--openssl-legacy-provider`；CI 在 Node 22 容器内由 EdgeOne CLI 自动构建。
