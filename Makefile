.PHONY: dev backend frontend build test lint

dev:
	@echo "Run 'make backend' and 'make frontend' in separate terminals."

backend:
	cd backend && STATIC_DIR=../frontend/dist go run ./cmd/server

frontend:
	npm --prefix frontend run dev

build:
	npm --prefix frontend run build
	cd backend && go build ./cmd/server

test:
	cd backend && go test ./...

lint:
	npm --prefix frontend run lint
	cd backend && go vet ./...
