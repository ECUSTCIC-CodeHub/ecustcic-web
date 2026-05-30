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
│   └── library/            # 图书数据库使用方法
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

- CNB：[https://cnb.cool/ecustcic/ecustcic-web](https://cnb.cool/ecustcic/ecustcic-web)
- GitHub：[https://github.com/ECUSTCIC-CodeHub/ecustcic-web](https://github.com/ECUSTCIC-CodeHub/ecustcic-web)
