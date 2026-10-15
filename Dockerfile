FROM node:24-alpine AS frontend

WORKDIR /src/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

FROM golang:1.27-alpine AS backend

WORKDIR /src
COPY backend/go.mod ./
COPY backend/cmd/ ./cmd/
COPY backend/internal/ ./internal/
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/server ./cmd/server

FROM scratch

WORKDIR /app

COPY --from=backend /out/server ./server
COPY --from=frontend /src/frontend/dist ./frontend/dist

ENV ADDR=:8080
ENV STATIC_DIR=/app/frontend/dist
EXPOSE 8080

USER 65532:65532
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD ["/app/server", "healthcheck"]

ENTRYPOINT ["/app/server"]
