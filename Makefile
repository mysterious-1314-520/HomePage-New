.PHONY: install dev start stop lint format docker-up docker-down clean help

install:
	cd server && npm install
	cd admin && npm install

dev: start

start:
	@bash start.sh

stop:
	@pkill -f "node server/index.js" 2>/dev/null || true
	@pkill -f "node admin/server.js" 2>/dev/null || true
	@echo "Services stopped"

lint:
	@npx eslint server/*.js server/routes/*.js admin/*.js

format:
	@npx prettier --write "server/**/*.js" "admin/**/*.js"

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

clean:
	@find . -name "node_modules" -type d -prune -exec rm -rf {} + 2>/dev/null || true
	@find . -name "*.log" -delete 2>/dev/null || true
	@echo "Cleaned"

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development servers"
	@echo "  make start      - Start all services"
	@echo "  make stop       - Stop all services"
	@echo "  make lint       - Run ESLint"
	@echo "  make format     - Format code with Prettier"
	@echo "  make docker-up  - Start with Docker"
	@echo "  make docker-down - Stop Docker containers"
	@echo "  make clean      - Clean dependencies and logs"
