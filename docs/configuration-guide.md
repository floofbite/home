# 配置指南（Runtime Config 版）

本项目的 Docker 运行配置统一放在 `deploy/config/`，不再要求编辑 `config/source`。

## 1. 目录结构

```text
deploy/
  config/
    app.env
    features.yaml
    services.yaml
```

容器内映射为 `/app/runtime-config/`。

---

## 2. app.env

示例模板：`deploy/config/app.env.example`

核心变量：

- `LOGTO_ENDPOINT`
- `LOGTO_APP_ID`
- `LOGTO_APP_SECRET`
- `LOGTO_COOKIE_SECRET`
- `BASE_URL_PROD`
- `BASE_URL_DEV`
- `LOGTO_M2M_CLIENT_ID`
- `LOGTO_M2M_CLIENT_SECRET`

可选：

- `SOCIAL_BINDING_CALLBACK_BASE_URL`

---

## 3. features.yaml

用途：控制账户中心功能开关、社交连接器、资料字段配置。

关键路径：

- `features.emailChange.enabled`
- `features.phoneChange.enabled`
- `features.usernameChange.enabled`
- `features.sessions.enabled`
- `features.accountDeletion.enabled`
- `features.socialIdentities.config.connectors`
- `profileFields.*`

---

## 4. services.yaml

用途：门户服务分类与服务列表。

关键结构：

- `serviceCategories[]`
- `services[]`

校验要求：

- `href` / `ping` 必须是合法 URL
- `services[].category` 必须存在于 `serviceCategories[].id`

---

## 5. 生效方式

修改配置后执行：

```bash
docker compose restart app
```

容器启动时会执行 runtime config 校验：

- 缺少文件会失败
- YAML 结构错误会失败
- 服务分类引用错误会失败

---

## 6. 与代码关系（最新架构）

- Server 侧：运行时从 `CONFIG_DIR` 加载 YAML 并校验
- Client 侧：通过 `/api/public-config` 获取公开配置
- 不再建议在 client 组件直接引用 `config/generated/*`
