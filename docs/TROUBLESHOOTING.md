# 排错指南

## 端口被占用

现象：启动时报 `EADDRINUSE`。

处理方式：确认 `4000` 和 `4001` 端口占用情况，关闭占用端口的进程，或通过环境变量调整端口。

```bash
# 查看端口占用
lsof -i :4000
lsof -i :4001
```

## 数据库无法写入

现象：后台保存配置失败，日志出现 SQLite 写入错误。

处理方式：检查 `data/` 目录是否存在，以及运行用户是否有写入权限。

```bash
# 查看数据目录
ls -la data
```

## 上传失败

现象：图片或音频上传接口返回错误。

处理方式：检查文件大小是否超过 `MAX_FILE_SIZE`，并确认 `static/uploads/` 目录可写。

```bash
# 查看上传目录
ls -la static/uploads
```

## 后台 API 访问失败

现象：后台页面打开正常，但数据加载失败。

处理方式：确认 API 服务 `4000` 已启动，后台代理服务 `4001` 已启动。

```bash
# 检查 API 服务
curl http://localhost:4000/api/config

# 检查后台服务
curl http://localhost:4001
```

## GitHub Actions 失败

常见原因：

- 依赖安装失败，检查 `server/package.json`。
- Lint 规则失败，运行 `npm run lint` 本地复现。
- Docker 构建失败，运行 `docker build -t homepage .` 本地复现。
