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

推送至 `master` 分支后自动触发构建部署：

- **EdgeOne Pages**：由 `.cnb.yml` 在 Node 22 容器内安装 EdgeOne CLI，再执行 `edgeone pages deploy -n ecustcic`；CLI 按 `edgeone.json` 自动执行 `npm install` 与 `npm run build:edge` 并部署至 [www.ecustcic.com](https://www.ecustcic.com)。函数由 CLI 从仓库根目录的 `edge-functions/`、`cloud-functions/` 打包，不再复制进 `dist/`；环境变量需在控制台预先配置（见上一节），否则登录与内容管理不可用
- **GitHub Pages**：由 `.github/workflows/workflow.yml` 执行构建并发布。该环境没有函数与 `/api/*`，仅作静态站点使用

注意：主站构建使用 Node.js 22。本地构建如遇 OpenSSL 报错，可临时设置 `NODE_OPTIONS=--openssl-legacy-provider`；CI 在 Node 22 容器内由 EdgeOne CLI 自动构建。
