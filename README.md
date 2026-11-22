# ECUSTCIC 官方网站

这是华东理工大学计算机信息交流协会(ECUSTCIC)的官方网站项目。该网站提供协会信息、活动公告、电竞赛事以及交流群等内容，旨在促进校内计算机爱好者的交流与学习。

## 项目概览

本项目基于 Vue.js 构建主站，VuePress 构建技术文档子站，提供了友好的用户界面和丰富的功能模块，包括但不限于：

- 协会介绍与公告发布
- 电竞赛事信息与报名
- QQ交流群汇总与管理
- 活动回顾与展示
- 技术文档与 FAQ

## 技术栈

| 组件 | 技术 |
|---|---|
| 主站前端框架 | Vue.js 2 |
| 技术文档子站 | VuePress 1.x |
| UI 组件 | Bootstrap 4 |
| 图标库 | Font Awesome |
| 主站构建工具 | Vue CLI |

## 项目结构

```
├── public/              # 静态资源（直接复制到构建产物）
│   └── tech/            # VuePress 构建产物（由 docs/ 生成，已 gitignore）
├── src/                 # 主站 Vue 源码
│   └── data/            # 数据文件
│       ├── esportsGames.js   # 电竞热门游戏数据
│       └── publicityData.js  # 组宣新闻和活动数据
├── docs/                # VuePress 技术文档源文件
│   ├── .vuepress/
│   │   ├── config.js        # VuePress 配置（侧边栏等）
│   │   ├── enhanceApp.js    # 应用增强（修复返回主站链接、滚动行为等）
│   │   ├── styles/
│   │   │   └── index.styl   # 全局样式覆盖
│   │   └── public/
│   │       ├── favicon.ico
│   │       └── logo-cic.png # 左上角 logo
│   ├── learning/            # 学习资源（课程攻略、图书数据库）
│   ├── faq/                 # 网络信息服务 FAQ
│   ├── dev/                 # 开发教程（游戏开发路径指南）
│   └── maintenance/         # 站点维护指南
├── cloud-functions/     # Cloud Functions（Node.js 运行时：OAuth 登录、图片上传、存储管理）
│   └── api/
├── edge-functions/      # Edge Functions（V8 运行时：活动/快讯读写，KV 存储）
│   └── api/
├── scripts/
│   ├── docs-postbuild.js       # VuePress 构建后处理脚本
│   └── copy-edge-functions.js  # 构建后把两类 Functions 复制进 dist/
├── vue.config.js        # 主站 Vue CLI 配置
└── package.json
```

## 开发指南

### 环境准备

确保你已安装以下工具：

- Node.js（推荐 v14 或更高版本）
- npm（通常随 Node.js 一起安装）

### 安装依赖

```bash
npm install
```

### 本地开发

#### 主站开发服务器

```bash
npm run serve
```

启动后，主站可通过 `http://localhost:8080` 访问。

#### 技术文档开发服务器

```bash
npm run docs:dev
```

启动后，技术文档可通过 `http://localhost:8080/tech/` 访问。

> ⚠️ `docs:dev` 仅用于实时预览文档修改效果，文档修改完成后仍需执行 `npm run docs:build` 将产物同步到 `public/tech/`，主站开发服务器才能正确加载最新文档。

### 构建生产版本

#### 仅构建主站

```bash
npx vue-cli-service build
```

构建后的文件将生成在 `dist/` 目录中。

#### 仅构建技术文档

```bash
npm run docs:build
```

此命令会：
1. 执行 `vuepress build docs`，将文档构建到 `dist/tech/`
2. 运行 `scripts/docs-postbuild.js` 后处理脚本：
   - 为目录式页面创建 `.html` 副本（如 `ecust-CourseShare/index.html` → `ecust-CourseShare.html`）
   - 修复"返回主站"和 logo 链接（将 `/tech/` 替换为 `/`，避免硬编码域名）
   - 将产物同步到 `public/tech/`

#### 一键构建全部（主站 + 技术文档）

```bash
npm run build
```

此命令依次执行主站构建和技术文档构建。

### 代码检查

```bash
npm run lint
```

## 数据修改指南

中心仓库为 CNB仓库：[https://cnb.cool/ecustcic/ecustcic-web](https://cnb.cool/ecustcic/ecustcic-web)，[GitHub](https://github.com/ECUSTCIC-CodeHub/ecustcic-web/)、[Gitcode](https://gitcode.com/ECUSTCIC-CodeHub/ecustcic-web/)、[Gitee](https://gitee.com/ecustcic/ecustcic-web)镜像仓库。  
⚠️修改请至 CNB仓库/GitHub，Gitcode、Gitee 镜像仓库仅用于同步。已建立 Github-CNB 双向同步。

### 修改电竞热门游戏数据

编辑 `/src/data/esportsGames.js` 文件。

### 修改技术文档

技术文档基于 VuePress 构建，源文件位于 `docs/` 目录下。

- `docs/.vuepress/config.js` — VuePress 配置（侧边栏等）
- `docs/.vuepress/enhanceApp.js` — 应用增强（修复返回主站链接、中文 hash 滚动行为等）
- `docs/.vuepress/styles/index.styl` — 全局样式覆盖（隐藏站点名称、长链接换行等）
- `docs/` 目录下的 Markdown 文件即为文档内容

技术文档子站采用统一大目录布局，所有板块（学习资源、网络FAQ、开发教程、站点维护）合并显示在左侧侧边栏中，顶部导航栏仅保留"返回主站"链接。

**修改流程：**

1. 编辑 `docs/` 下的 Markdown 文件或 `config.js`
2. 预览：`npm run docs:dev`
3. 构建并同步到主站：`npm run docs:build`
4. 验证主站效果：`npm run serve`，访问 `http://localhost:8080/tech/`

### 修改交流群信息

添加新群请直接提交[表单](https://n0ytxc474x.feishu.cn/share/base/form/shrcn5SJVIvKbkfDZxQsn0djtng)，已存在群聊需要增加群链接可提 issue / 提交新表单。为保证网站信息安全可靠，新群信息需要人工审核，非实时同步网站。如太久未更新，可提 issue。

![交流群申请表单](ECUSTjiaoliuqun_Application_Form.png)

### 修改组宣新闻和活动

编辑 `/src/data/publicityData.js` 文件。

### 内容管理（活动 / 快讯 / 图片存储）

活动、快讯与封面图片由 EdgeOne Pages 的函数提供，后台入口 `/admin`（需 ECUSTMC 皮肤站账号，且 `permission >= 1`）。

- 前台：`/activities` 活动回顾、`/news` 快讯、`/activity/:id` 详情，首页顶部展示最新条目
- 数据：Edge Function + KV（控制台绑定变量名 `activities_kv`，数据存在 `activities:list`）
- 图片：Cloud Function + Blob 存储（store 名 `activity-covers`，只允许 `covers/` 前缀）
- 正文是 Markdown，前台用 `mavon-editor` 渲染，其内置 FilterXSS 会按白名单过滤 HTML。**不要关闭 `html`/`xssOptions`，也不要在未净化的情况下换用 `v-html` 渲染正文**
- 图片被任意活动/快讯引用时，服务端会拒绝删除（由后端重新核对，不依赖前端判断）

接口一览：

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

"管理令牌"有两种：

1. 后台页面通过 `/api/auth/token` 用登录会话兑换的 **2 小时短期令牌**（默认路径，只存在浏览器内存里）
2. 控制台配置的 `MACHINE_TOKEN` 机器凭证（仅供脚本 / CI 直接调用写接口，不下发浏览器）

### AI 检测助手

服务工具箱中的「AI 检测助手」（`/service/ai-detect`）用于判断文本是否由 AI 生成，**必须登录后使用**。

- 前端：`src/views/Service/AiDetect.vue`，入口在 `/service` 工具箱
- 后端：`POST /api/ai-detect`，校验 `cic_session` 登录会话后转发到 EdgeOne Makers 内置模型 `@makers/zhuque-text`
- 密钥：在 EdgeOne 控制台 **Makers - Models - API Key** 创建，配置为环境变量 `MAKERS_MODELS_KEY`；密钥只存在服务端，不下发浏览器
- 限制：单次最多 5000 字；模型调用计入 Makers 每月免费额度
- 结果仅供参考：接口返回整体置信度、人工 / 疑似 AI / AI 三档占比，以及（不合并段落时）逐段标签
- 图片检测不在本接口内，页面会引导前往腾讯朱雀官网

### 贡献方式

开启一个 Pull Request

## 部署

生产环境由 EdgeOne Pages 托管，推送 `master` 后由 `.cnb.yml` 自动执行 `npm install` → `npm run build` → `edgeone pages deploy -n ecustcic ./dist`。

`npm run build` 生成：

```
dist/
├── index.html           # 主站入口
├── tech/                # 技术文档（VuePress 产物）
├── js/ css/ ...         # 主站静态资源
├── edge-functions/      # 由 scripts/copy-edge-functions.js 复制（V8 运行时）
├── cloud-functions/     # 同上（Node.js 运行时，Blob SDK）
└── package.json         # 被重写为只含 @edgeone/pages-blob 的极简版
```

注意：

- **必须随 `dist/` 一起部署 `edge-functions/` 与 `cloud-functions/`**，否则 `/api/*` 全部 404，登录与内容管理不可用
- **部署前必须重新构建**：旧 `dist/` 里保存的是上一版函数代码（例如旧的鉴权逻辑），直接 `edgeone pages deploy ./dist` 会把旧代码发上线
- 环境变量在控制台配置，见下文「环境变量（EdgeOne Pages 控制台）」；缺少 `OAUTH_STATE_SECRET` / `SITE_URL` 会让登录直接返回 500
- 只做纯静态托管（Nginx / GitHub Pages）时页面可正常浏览，但没有 `/api/*`，后台管理与动态内容不可用

### 环境变量（EdgeOne Pages 控制台）

在 EdgeOne Pages 控制台「环境变量」中配置，缺少必填项时对应功能不可用：

| 变量 | 必填 | 说明 |
|---|---|---|
| `OAUTH_STATE_SECRET` | 是 | 会话与管理令牌的签名密钥，随机长字符串。缺失时 `/api/auth/*` 直接返回 500（fail-closed）。**更换后所有已登录用户需重新登录** |
| `SITE_URL` | 是 | 本站对外地址，如 `https://www.ecustcic.com`（必须 https、结尾不带斜杠）。用于拼 OAuth `redirect_uri`、CORS 白名单、删除图片前的回源校验；不配则无法登录 |
| `BS_CLIENT_ID` | 是 | Blessing Skin OAuth 客户端 ID |
| `BS_CLIENT_SECRET` | 是 | Blessing Skin OAuth 客户端 Secret |
| `BS_BASE_URL` | 是 | 皮肤站地址，如 `https://mcskin.ecustvr.top` |
| `BS_OAUTH_SCOPE` | 否 | 默认 `User.Read`；设为空字符串表示不传 scope 参数 |
| `MACHINE_TOKEN` | 否 | 机器凭证，供 curl / CI 直接调用写接口 |
| `MAKERS_MODELS_KEY` | 否（AI 检测助手必填） | EdgeOne Makers 内置模型 API Key，用于调用朱雀文本检测；未配置时 `/api/ai-detect` 返回 500 |

> 旧变量 `ADMIN_TOKEN` 已废弃：它曾由 `/api/auth/token` 明文返回给浏览器，历史值应视为已泄露。升级后请从控制台删除该变量；确需脚本化写入时改用新生成的 `MACHINE_TOKEN`。

控制台还需完成的一次性配置：

- KV 存储：创建命名空间并绑定为全局变量 `activities_kv`
- Blob 存储：函数内使用 `activity-covers`，无需额外创建

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

## 自定义配置

有关更多配置信息，请参阅 [Vue CLI 配置参考](https://cli.vuejs.org/config/)。

## 许可证

[MIT](LICENSE) © ECUSTCIC
