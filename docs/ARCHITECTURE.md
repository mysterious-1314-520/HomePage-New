# 架构说明

## 系统架构

HomePage 采用前后端分离架构，但部署时通过单一后端服务统一提供静态资源和 API。

```
用户浏览器
    |
    +--> 主页 (index.html) :4000
    |       |
    |       +--> Fastify 静态服务
    |       +--> /api/* 动态数据
    |
    +--> 后台管理 (admin/index.html) :4001
            |
            +--> Node HTTP 静态服务
            +--> 反向代理 /api/* -> :4000
                    |
                    +--> Fastify API
                            |
                            +--> SQLite (data/homepage.db)
```

## 组件说明

### 1. 主页服务 (server/index.js)

基于 Fastify 构建，提供：
- 静态文件服务（HTML/CSS/JS/图片）
- REST API（`/api/*`）
- SPA 路由回退
- 文件上传（`@fastify/multipart`）

### 2. 数据库层 (server/database.js)

基于 better-sqlite3：
- 单文件 SQLite 数据库
- 自动建表和种子数据初始化
- 同步查询，简单高效

### 3. API 路由 (server/routes/api.js)

提供站点配置、标签、时间线、项目、技能、音乐、友链、统计等全部接口。

### 4. 后台管理代理 (admin/server.js)

基于原生 Node.js HTTP 模块：
- 提供管理页面静态服务
- 反向代理 API 请求到主服务
- 避免跨域问题

### 5. 前端展示 (index.html)

原生 HTML + CSS + JavaScript：
- 6 套主题切换
- 中英双语
- 响应式三端适配

## 数据流

1. 浏览器请求 `index.html`
2. 页面加载后通过 fetch 调用 `/api/*` 获取数据
3. 后端从 SQLite 读取数据并返回 JSON
4. 前端动态渲染内容

## 目录职责

| 目录 | 职责 |
|------|------|
| `server/` | 后端服务（Fastify + SQLite） |
| `admin/` | 后台管理页面和代理服务器 |
| `static/` | 前端静态资源（CSS/JS/图片/音频） |
| `data/` | 数据库文件 |
| `docs/` | 项目文档 |
