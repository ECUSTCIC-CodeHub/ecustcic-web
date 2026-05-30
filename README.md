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
├── scripts/
│   └── docs-postbuild.js    # VuePress 构建后处理脚本
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

> 电竞部公共/赛事/活动直接调用[电竞部独立网站](https://ecustegame.top/)，不在本站修改，附上电竞部网站[Github仓库](https://github.com/hearthewind9/ecustegame-website)

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

### 贡献方式

开启一个 Pull Request

## 部署

构建完成后，`npm run build` 会生成以下产物：

```
dist/                    # 主站构建产物
├── index.html           # 主站入口
├── tech/                # 技术文档（VuePress 产物，已同步到 public/tech/）
├── js/                  # 主站 JS
├── css/                 # 主站 CSS
└── ...
```

将 `dist/` 目录的内容部署到 Web 服务器即可。注意：

- 主站使用 HTML5 History Mode 路由，需配置服务器将所有非文件请求回退到 `index.html`
- `/tech/` 路径下的文件为纯静态文件，不需要回退处理
- Nginx 示例配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/ecustcic-web;

    # 主站 SPA 回退
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 技术文档为纯静态，不需要回退
    location /tech/ {
        try_files $uri $uri/ =404;
    }
}
```

## 自定义配置

有关更多配置信息，请参阅 [Vue CLI 配置参考](https://cli.vuejs.org/config/)。

## 许可证

[MIT](LICENSE) © ECUSTCIC
