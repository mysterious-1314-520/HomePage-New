# 部署指南

## 方式一：本地部署

### 前置要求

- Node.js >= 16
- npm >= 8

### 步骤

```bash
# 克隆仓库
git clone https://github.com/mysterious-1314-520/HomePage-New.git
cd HomePage-New

# 安装依赖
cd server && npm install && cd ..
cd admin && npm install && cd ..

# 配置环境变量
cp .env.example .env
# 按需修改 .env

# 启动服务
./start.sh
```

## 方式二：Docker 部署

### 使用 docker-compose

```bash
docker-compose up -d
```

### 自定义构建

```bash
docker build -t homepage .
docker run -d \
  -p 4000:4000 \
  -p 4001:4001 \
  -v homepage-data:/app/data \
  -v homepage-uploads:/app/static/uploads \
  --name homepage \
  homepage
```

## 方式三：反向代理部署 (Nginx)

建议生产环境使用 Nginx 反向代理：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 主页
    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 后台管理
    location /admin {
        proxy_pass http://127.0.0.1:4001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 上传文件大小限制
    client_max_body_size 10m;
}
```

配合 HTTPS：

```bash
# 使用 certbot 申请证书
certbot --nginx -d your-domain.com
```

## 生产环境检查清单

- [ ] 修改默认管理员密码
- [ ] 配置 HTTPS
- [ ] 设置防火墙（仅开放 80/443）
- [ ] 配置数据库定期备份
- [ ] 设置日志轮转
- [ ] 配置进程守护（PM2/systemd）

## 进程守护 (PM2)

```bash
npm install -g pm2

# 启动后端
pm2 start server/index.js --name homepage-api

# 启动后台管理
pm2 start admin/server.js --name homepage-admin

# 保存当前进程列表
pm2 save
```

## 数据备份

```bash
# 手动备份
cp data/homepage.db data/backup-$(date +%Y%m%d).db

# 手动恢复
cp data/backup-20240101.db data/homepage.db
```

## 端口说明

| 服务 | 端口 | 说明 |
|------|------|------|
| 主页 + API | 4000 | Fastify 服务 |
| 后台管理 | 4001 | Node HTTP 代理 |
