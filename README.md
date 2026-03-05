# Logto Account Center & Portal

一个基于 **Next.js 15** + **shadcn/ui** 构建的账户中心与服务门户，支持 Logto 登录、账户资料管理、安全设置和服务导航。

## 功能概览

- 账户中心：概览、个人资料、安全设置、社交连接、偏好设置
- 服务门户：服务分类、搜索、快速跳转
- 认证方式：Logto OIDC（`@logto/next`）+ 按需 Management API（M2M）

## 技术栈

- Next.js 15（App Router）
- React 19 + TypeScript 5
- Tailwind CSS 4 + shadcn/ui
- Logto SDK（`@logto/next`）+ `@logto/api`

---

## 本地开发

### 1) 安装依赖

```bash
npm install
```

### 2) 配置环境变量

```bash
cp .env.example .env.local
```

按需填写 `.env.local`：

- `LOGTO_ENDPOINT`
- `LOGTO_APP_ID`
- `LOGTO_APP_SECRET`
- `LOGTO_COOKIE_SECRET`
- `BASE_URL_DEV`
- `BASE_URL_PROD`
- `LOGTO_M2M_CLIENT_ID`
- `LOGTO_M2M_CLIENT_SECRET`

### 3) 启动开发环境

```bash
npm run dev
```

访问：`http://localhost:3000`

---

## Docker 部署（宿主机配置文件映射）

> 目标：配置文件放在宿主机，修改后只需重启容器即可生效。

### 目录与文件说明

Docker 方案会挂载以下宿主机文件：

- `./.env` -> `/app/.env`
- `./config/source/services.yaml` -> `/app/config/source/services.yaml`
- `./config/source/features.yaml` -> `/app/config/source/features.yaml`

容器启动时会自动执行：

1. 读取 `/app/.env`
2. 基于 `/app/config/source/*.yaml` 生成 `config/generated/*.ts`
3. 执行 `next build`
4. 启动 `next start`

### 首次启动

1) 准备环境变量文件：

```bash
cp .env.example .env
```

2) 编辑 `.env`

3) 启动：

```bash
docker compose up -d --build
```

4) 查看日志：

```bash
docker compose logs -f app
```

访问：`http://localhost:1742`

### 配置修改如何生效

- 修改 `.env` 或 `config/source/*.yaml` 后，执行：

```bash
docker compose restart app
```

即可生效（容器重启时会重新生成配置并重新构建）。

### 什么时候需要 `--build`

只有在以下情况需要重新构建镜像：

- 修改了 `Dockerfile`
- 修改了 `package.json` / `package-lock.json`
- 升级 Node/系统依赖

命令：

```bash
docker compose up -d --build
```

---

## 配置文件编写指南

配置说明已独立到文档：

- `docs/configuration-guide.md`

包含内容：

- `.env / .env.local` 环境变量说明
- `config/source/features.yaml` 功能与社交连接器配置
- `config/source/services.yaml` 门户服务配置
- 社交绑定 `redirect_uri` 白名单与回调域名配置注意事项
- 本地与 Docker 生效方式

---

## 常见问题

### 1) 为什么改了 YAML 没生效？

确认你修改的是宿主机映射路径：

- `./config/source/services.yaml`
- `./config/source/features.yaml`

然后执行：

```bash
docker compose restart app
```

### 2) 启动时报配置文件缺失

容器入口会校验：

- `/app/config/source/services.yaml`
- `/app/config/source/features.yaml`

请确认宿主机目录存在且包含这两个文件。

### 3) YAML 格式错误怎么办？

生成脚本会在启动时校验格式并报错。请先修复 YAML 缩进、字段名与 URL 格式，再重启容器。

### 4) 端口如何修改？

修改 `docker-compose.yml` 中的：

```yaml
ports:
  - "1742:3000"
```

左侧是宿主机端口，右侧是容器端口。

---

## 生产建议

- 使用强随机 `LOGTO_COOKIE_SECRET`
- 生产环境必须使用 HTTPS
- 最小化 M2M 权限范围
- 定期更新依赖与基础镜像

---

## 许可证

[MIT](LICENSE)
