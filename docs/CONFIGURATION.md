# 配置说明

## 环境变量

项目提供 `.env.example` 作为配置模板，生产环境建议复制为 `.env` 后按需修改。

| 变量 | 默认值 | 说明 |
|------|--------|------|
| `PORT` | `4000` | 主页和 API 服务端口 |
| `DB_PATH` | `./data/homepage.db` | SQLite 数据库路径 |
| `UPLOAD_DIR` | `./static/uploads` | 上传文件目录 |
| `MAX_FILE_SIZE` | `10485760` | 单文件上传大小上限，单位字节 |
| `ADMIN_PASSWORD` | `admin123` | 初始管理员密码 |
| `CORS_ORIGIN` | `*` | CORS 允许来源 |

## 数据目录

| 路径 | 用途 |
|------|------|
| `data/homepage.db` | 主数据库 |
| `static/uploads/` | 后台上传资源 |
| `static/img/` | 内置图片资源 |
| `static/audio/` | 音频资源 |

## 生产环境建议

- 修改默认管理员密码。
- 为 `data/` 和 `static/uploads/` 配置持久化存储。
- 使用 HTTPS 访问后台管理入口。
- 对数据库文件做定期备份。
- 为上传目录设置容量监控。
