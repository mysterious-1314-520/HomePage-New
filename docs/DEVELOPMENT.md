# 开发指南

## 环境要求

- Node.js `20.x`，也可参考 `.nvmrc`。
- npm `8.x` 或更高版本。

## 安装依赖

```bash
# 安装后端依赖
cd server
npm install

# 安装后台依赖
cd ../admin
npm install
```

## 常用命令

```bash
# 启动所有服务
npm run dev

# 仅启动 API 服务
npm run server

# 仅启动后台管理服务
npm run admin

# 代码检查
npm run lint

# 代码格式检查
npm run format:check
```

## 分支和提交规范

推荐使用 Conventional Commits：

```text
feat: 添加新功能
fix: 修复问题
docs: 更新文档
chore: 调整工程配置
refactor: 重构代码
ci: 调整 CI 配置
```

## 目录职责

| 路径 | 说明 |
|------|------|
| `server/` | Fastify API 和 SQLite 数据层 |
| `admin/` | 后台管理页面与代理服务 |
| `static/` | 前端静态资源 |
| `docs/` | 项目维护文档 |
| `.github/` | GitHub 协作和自动化配置 |
