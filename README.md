# HomePage - 计堡个人主页

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16-green.svg)
![Version](https://img.shields.io/badge/version-1.0.0-brightgreen.svg)
![CI](https://img.shields.io/github/actions/workflow/status/mysterious-1314-520/HomePage-New/node.js.yml)
![Stars](https://img.shields.io/github/stars/mysterious-1314-520/HomePage-New)

一个功能完整的个人主页系统，包含动态主页展示和后台管理功能。

## 功能特性

### 主页展示
- 动态欢迎语（支持简单模式/自定义HTML）
- 个人标签展示
- 时间线展示
- 社交链接（GitHub、Bilibili、QQ、Email等）
- 项目展示（支持详情弹窗）
- 技能展示（进度条动画）
- 音乐播放器
- 友情链接
- 公告横幅
- 多主题切换（6套主题）
- 多语言支持（中/英）
- 页面动效

### 后台管理
- 站点配置管理
- 标签/时间线/社交链接管理
- 项目管理（支持详情编辑）
- 版本管理
- 公告管理
- 音乐管理
- 技能管理
- 友情链接管理
- 访问统计（PV/UV + 7天趋势图）
- 登录背景图片配置
- 图片上传功能

### 项目详情弹窗
- 技术栈标签
- 项目介绍
- 截图画廊
- GitHub/演示/视频/下载按钮
- 三端适配（桌面/平板/移动端）
- 毛玻璃效果

### 登录页面
- 毛玻璃效果
- 自定义背景图片（支持在线URL/上传图片）
- 三端适配
- 渐变背景

## 技术栈

- **前端**：HTML5 + CSS3 + JavaScript (原生)
- **后端**：Node.js + Fastify
- **数据库**：SQLite (better-sqlite3)
- **代理**：纯 Node.js HTTP 模块

## 快速开始

### 安装依赖

```bash
cd server
npm install
```

### 启动服务

```bash
# 启动后端服务 (端口 4000)
cd server
npm start

# 启动后台管理服务器 (端口 4001)
cd admin
node server.js
```

### 访问地址

- 主页：`http://localhost:4000`
- 后台管理：`http://localhost:4001`
- 默认密码：`admin123`

## 项目结构

```
HomePage/
├── index.html          # 动态主页
├── favicon.ico         # 网站图标
├── admin/
│   ├── index.html      # 后台管理页面
│   └── server.js       # 后台代理服务器
├── server/
│   ├── index.js        # Fastify 后端入口
│   ├── database.js     # SQLite 数据库
│   └── routes/
│       └── api.js      # API 路由
├── static/
│   ├── css/
│   │   └── style.css   # 主页样式（含6套主题）
│   ├── img/            # 图片资源
│   └── uploads/        # 上传文件目录
└── data/
    └── homepage.db     # SQLite 数据库文件
```

## 配置说明

### 环境变量

复制 `.env.example` 为 `.env` 并根据需要修改配置：

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| PORT | 4000 | 服务器端口 |
| DB_PATH | ./data/homepage.db | 数据库路径 |
| UPLOAD_DIR | ./static/uploads | 上传文件目录 |
| MAX_FILE_SIZE | 10485760 | 最大文件大小(字节) |
| ADMIN_PASSWORD | admin123 | 管理员密码 |

### 数据库

使用 SQLite 数据库，首次启动会自动创建并初始化种子数据。

### Docker 部署

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

### 主题配置

支持6套主题：
- `default` - 默认（浅色紫蓝）
- `dark` - 暗色
- `ocean` - 海洋（蓝青色）
- `sunset` - 日落（暖橙）
- `forest` - 森林（绿色）
- `ocean-dark` - 深海（暗蓝）

### 登录背景

在后台管理 → 站点设置 → 登录页面设置中配置：
- 支持在线图片URL
- 支持上传图片

## 开发计划

- [x] 独立后端服务
- [x] 动态主页
- [x] 后台管理面板
- [x] 图片上传功能
- [x] 访问统计
- [x] 主题切换
- [x] 技能展示
- [x] 项目详情弹窗
- [x] 多语言支持
- [x] 登录页面整改
- [x] 登录背景图片

## 许可证

MIT License

## 作者

计堡

- GitHub: [@hanbao233xD](https://github.com/hanbao233xD)
- Bilibili: [@计堡](https://space.bilibili.com/299635441)
