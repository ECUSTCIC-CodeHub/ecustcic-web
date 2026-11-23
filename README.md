# ECUSTCIC 官方网站

这是华东理工大学计算机信息交流协会(ECUSTCIC)的官方网站项目。该网站提供协会信息、活动公告、电竞赛事以及交流群等内容，旨在促进校内计算机爱好者的交流与学习。

**线上地址**：<https://www.ecustcic.com>　**文档子站**：<https://www.ecustcic.com/tech/>

## 功能模块

- 协会介绍与公告发布
- 活动回顾与快讯（后台可管理）
- 电竞赛事信息与交流群汇总
- AI 检测助手等在线工具
- 技术文档与 FAQ

## 技术栈

| 组件 | 技术 |
|---|---|
| 主站前端框架 | Vue.js 2 |
| 技术文档子站 | VuePress 1.x |
| UI 组件 | Bootstrap 4 |
| 后端 | EdgeOne Pages Functions（Node.js / V8 运行时） |
| 主站构建工具 | Vue CLI |

## 项目结构

```
├── public/              # 静态资源（直接复制到构建产物）
├── src/                 # 主站 Vue 源码
│   └── data/            # 电竞数据等前端静态数据
├── docs/                # VuePress 技术文档源文件（含站点维护指南）
├── cloud-functions/     # Cloud Functions（Node.js 运行时：OAuth 登录、图片上传、存储管理）
├── edge-functions/      # Edge Functions（V8 运行时：活动/快讯读写，KV 存储）
├── scripts/             # 构建后处理脚本
├── vue.config.js        # 主站 Vue CLI 配置
└── package.json
```

## 开发指南

### 环境准备

确保你已安装以下工具：

- Node.js 22（与 CI 一致）
- npm（通常随 Node.js 一起安装）

### 常用命令

| 命令 | 说明 |
|---|---|
| `npm install` | 安装依赖 |
| `npm run serve` | 主站开发服务器，访问 `http://localhost:8080` |
| `npm run docs:dev` | 技术文档实时预览（修改文档后仍需 `npm run docs:build` 同步） |
| `npm run build` | 一键构建主站 + 文档（手动部署时使用，含函数副本） |
| `npm run build:edge` | CI 使用的构建命令（不含函数副本） |
| `npm run lint` | 代码检查 |

## 内容维护

站点维护与内容更新的完整指南（技术文档、电竞与交流群数据、活动/快讯/图片内容管理、部署与环境变量）见 **[站点维护指南](docs/maintenance/quickstart/README.md)**，线上版本位于文档子站 `/tech/maintenance/quickstart/`。

**内容管理简述：**

- 后台入口 `/admin`，需 ECUSTMC 皮肤站账号且管理员权限
- 交流群信息已在飞书多维表格维护，通过官方表单提交更新（见 `/e-sports/detail` 页面底部）
- 部署由 EdgeOne Pages 托管，推送 `master` 后 CI 自动构建，环境变量在 EdgeOne 控制台配置

## 代码仓库

中心仓库为 CNB 仓库：[https://cnb.cool/ecustcic/ecustcic-web](https://cnb.cool/ecustcic/ecustcic-web)，[GitHub](https://github.com/ECUSTCIC-CodeHub/ecustcic-web/) 为镜像（双向同步）。修改请提交至 CNB 或 GitHub 仓库。

## 贡献方式

开启一个 Pull Request

## 自定义配置

有关更多配置信息，请参阅 [Vue CLI 配置参考](https://cli.vuejs.org/config/)。

## 许可证

[MIT](LICENSE) © ECUSTCIC
