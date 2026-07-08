.PHONY: install dev start lint format format-check docker-up docker-down help

install:
	cd server && npm install
	cd admin && npm install

dev: start

start:
	@bash start.sh

lint:
	@npx eslint server/*.js server/routes/*.js admin/*.js

format:
	@npx prettier --write "server/**/*.js" "admin/**/*.js"

format-check:
	@npx prettier --check "server/**/*.js" "admin/**/*.js"

docker-up:
	docker-compose up -d

docker-down:
	docker-compose down

help:
	@echo "Available commands:"
	@echo "  make install    - Install dependencies"
	@echo "  make dev        - Start development servers"
	@echo "  make start      - Start all services"
	@echo "  make lint       - Run ESLint"
	@echo "  make format     - Format code with Prettier"
	@echo "  make format-check - Check formatting with Prettier"
	@echo "  make docker-up  - Start with Docker"
	@echo "  make docker-down - Stop Docker containers"
