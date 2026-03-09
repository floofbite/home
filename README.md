# Logto Account Center & Portal

基于 **Next.js 15（App Router）** + **Logto** 的账户中心与服务门户。

## 一、配置约定

无论本地开发还是 Docker 部署，统一使用以下路径：

- `/.env`
- `/deploy/features.yaml`
- `/deploy/services.yaml`

仓库内仅提供示例文件：

- `/.env.example`
- `/deploy/features.yaml.example`
- `/deploy/services.yaml.example`

---

## 二、本地开发

### 1) 安装依赖

```bash
npm install
```

### 2) 准备配置文件

```bash
cp .env.example .env
cp deploy/features.yaml.example deploy/features.yaml
cp deploy/services.yaml.example deploy/services.yaml
```

### 3) 依据您的实际情况修改配置

详见[docs/configuration-guide.md](docs/configuration-guide.md)。

### 4) 启动

```bash
npm run dev
```

访问：`http://localhost:3000`

---

## 三、Docker 部署

### 1) 准备部署目录

```bash
mkdir -p account-center/deploy
cd account-center
```

### 2) 下载配置模板

```bash
curl -fsSL -o .env https://raw.githubusercontent.com/CertStone/logto-account-portal/main/.env.example
curl -fsSL -o deploy/features.yaml https://raw.githubusercontent.com/CertStone/logto-account-portal/main/deploy/features.yaml.example
curl -fsSL -o deploy/services.yaml https://raw.githubusercontent.com/CertStone/logto-account-portal/main/deploy/services.yaml.example
curl -fsSL -o docker-compose.yml https://raw.githubusercontent.com/CertStone/logto-account-portal/main/docker-compose.yml
```

编辑 `.env` / `deploy/*.yaml` 后再启动。详见[docs/configuration-guide.md](docs/configuration-guide.md)。

### 3) 启动

```bash
docker compose pull
docker compose up -d
```

查看日志：

```bash
docker compose logs -f app
```

---

## 四、项目功能

### 账户中心（Dashboard）

- 个人资料管理（头像、姓名、资料字段）
- 安全设置（密码、MFA、Passkey、登录历史）
- 社交账号绑定与解绑（Google/GitHub/QQ 等）
- 会话管理与账户删除（可按 features 控制）

### 服务门户（Portal）

- 服务分类导航
- 关键词搜索
- 服务可用性探测（通过 groupName/serviceName 的受控检查接口）

---

## 五、项目特色

- **统一配置模型**：开发与部署都使用 `.env + deploy/*.yaml`
- **运行时配置加载**：无需 YAML 生成 TS，配置修改后重启容器即可生效
- **配置校验内建**：容器启动前自动校验 env/yaml，减少线上配置错误
- **认证边界清晰**：区分用户 Token 与 M2M Token，降低权限误用风险
- **前后端解耦**：Client 通过 `/api/public-config` 获取公开配置

---

## 六、配置说明

详见：`docs/configuration-guide.md`
