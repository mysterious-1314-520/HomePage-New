# 维护指南

## 发布流程

1. 更新 `CHANGELOG.md`。
2. 更新 `package.json` 版本号。
3. 创建版本标签。
4. 推送标签触发 Release 工作流。

```bash
# 创建版本标签
git tag v1.0.1

# 推送版本标签
git push origin v1.0.1
```

## 依赖维护

Dependabot 每周检查：

- `server/` npm 依赖。
- `admin/` npm 依赖。
- Docker 基础镜像。
- GitHub Actions 版本。

## 数据维护

- `data/homepage.db` 为运行数据，部署时需要持久化。
- `data/*.db-wal` 和 `data/*.db-shm` 为 SQLite 运行时文件。
- 备份时优先在服务低峰期复制数据库文件。

## 标签约定

| 标签 | 用途 |
|------|------|
| `bug` | 缺陷修复 |
| `enhancement` | 功能增强 |
| `documentation` | 文档改动 |
| `backend` | 后端相关 |
| `frontend` | 前端相关 |
| `ci` | CI/CD 相关 |
| `dependencies` | 依赖升级 |
