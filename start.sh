#!/bin/bash

# HomePage 启动脚本

echo "正在启动 HomePage..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: Node.js 未安装"
    exit 1
fi

# 安装后端依赖
if [ ! -d "server/node_modules" ]; then
    echo "正在安装后端依赖..."
    cd server && npm install && cd ..
fi

# 启动后端服务
echo "启动后端服务 (端口 4000)..."
cd server && node index.js &
SERVER_PID=$!

# 等待后端启动
sleep 2

# 启动后台管理服务
echo "启动后台管理服务 (端口 4001)..."
cd admin && node server.js &
ADMIN_PID=$!

echo ""
echo "========================================"
echo "HomePage 已启动!"
echo "主页: http://localhost:4000"
echo "后台管理: http://localhost:4001"
echo "默认密码: admin123"
echo "========================================"
echo ""
echo "按 Ctrl+C 停止服务"

# 等待中断信号
trap "kill $SERVER_PID $ADMIN_PID; exit" SIGINT SIGTERM

wait
