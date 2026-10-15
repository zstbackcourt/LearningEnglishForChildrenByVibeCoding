# Little Lingo

面向少儿的英语学习 Web 应用。第一阶段以 3L English 为课程框架，逐步实现听、说、读、练和学习进度功能。

## 技术栈

- 后端：Go，标准库 HTTP Server
- 前端：React 19、TypeScript、Vite
- 部署：多阶段 Docker 单镜像，Go 服务同时提供 API 和前端静态资源

## 本地开发

环境要求：

- Go 1.24+
- Node.js 20.19+ 或 22.13+
- npm 10+

安装前端依赖：

```bash
npm --prefix frontend install
```

分别启动后端和前端：

```bash
make backend
make frontend
```

打开 <http://localhost:5173>。Vite 会将 `/api` 请求代理至 <http://localhost:8080>。

## 验证

```bash
make test
make lint
make build
```

健康检查：

```bash
curl http://localhost:8080/api/v1/health
```

## Docker 部署

```bash
docker compose up --build
```

打开 <http://localhost:8080>。生产镜像以非 root 用户运行，并内置健康检查。

## 目录

```text
backend/cmd/      Go 服务入口
backend/internal/ HTTP 路由与课程 API
frontend/         React 前端
```

目前课程 API 中仅有用于验证产品流程的示例内容。正式录入 3L 教材前，需要确认所采用版本及内容授权范围。
