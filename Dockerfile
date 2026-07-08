FROM node:18-alpine

LABEL maintainer="计堡"
LABEL description="HomePage - 个人主页系统"

WORKDIR /app

# 复制 package 文件并安装依赖
COPY server/package.json ./server/
COPY admin/package.json ./admin/

RUN cd server && npm install --production && cd .. \
    && cd admin && npm install --production && cd ..

# 复制项目文件
COPY . .

# 创建数据和上传目录
RUN mkdir -p data static/uploads

# 暴露端口
EXPOSE 4000 4001

# 环境变量
ENV NODE_ENV=production
ENV PORT=4000

# 启动命令
CMD ["sh", "-c", "node server/index.js & node admin/server.js & wait"]
