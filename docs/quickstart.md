# 本站维护快速入门指南

## 关于本站

这是一个基于 Vue 2 的文档站点，支持 Markdown 文件加载。

### 功能特点

- 支持加载外部 Markdown 文件
- 实时预览
- 响应式设计
- 左侧导航菜单

### 使用方法

1. 在 `public/docs` 目录下创建 Markdown 文件
2. 在 `src/data/menu.js` 的 `menuItems` 数组中添加对应的菜单项
3. 点击左侧菜单即可查看对应文档 

### 项目地址
> 理论上，CNB仓库会自动（非实时）推送到 GitHub 、 Gitcode 和 Gitee 仓库
- [GitHub: https://github.com/ECUSTCIC-CodeHub/ecustcic-web](https://github.com/ECUSTCIC-CodeHub/ecustcic-web)
- [CNB: https://cnb.cool/ecustcic/ecustcic-web](https://cnb.cool/ecustcic/ecustcic-web)

## 快速修改配置
### 电竞热门游戏
```
/src/data/esportsGames.js
```

### 交流群
```
/src/data/qqGroups.js
```

### 文档菜单
```
/src/data/menu.js
```

## 快速开始
1. 安装依赖
```
npm install
```

2. 启动开发服务器
```
npm run serve
```

## 其他命令（可选）
- 构建生产版本: ```npm run build```
- 运行测试: ```npm run test```

获取更多信息请访问项目仓库：[https://cnb.cool/ecustcic/ecustcic-web](https://cnb.cool/ecustcic/ecustcic-web)