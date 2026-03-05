# 配置文件编写指南

本文档说明本项目所有可编辑配置文件的用途、字段规范和常见注意事项。

## 1. 配置文件总览

| 文件 | 用途 |
| --- | --- |
| `.env` / `.env.local` | 运行时环境变量（Logto、回调域名、M2M 凭据等） |
| `config/source/features.yaml` | 账户中心功能开关、社交连接器、资料字段配置 |
| `config/source/services.yaml` | 门户服务分类与服务清单 |

> `config/generated/*.ts` 为自动生成文件，不要手改。修改源配置后请执行 `npm run config:generate`（`npm run dev/lint/build` 已自动包含）。

---

## 2. 环境变量配置（.env / .env.local）

建议至少配置以下字段：

- `LOGTO_ENDPOINT`：Logto 租户地址（如 `https://xxx.logto.app`）
- `LOGTO_APP_ID` / `LOGTO_APP_SECRET`：Logto 应用凭据
- `LOGTO_COOKIE_SECRET`：Cookie 加密密钥（建议 >= 32 字符）
- `BASE_URL_DEV` / `BASE_URL_PROD`：应用在开发/生产环境对外访问地址
- `LOGTO_M2M_CLIENT_ID` / `LOGTO_M2M_CLIENT_SECRET`：Management API 所需

### 社交绑定回调域名（关键）

新增可选项：

- `SOCIAL_BINDING_CALLBACK_BASE_URL`

用途：强制社交绑定流程使用该域名生成回调地址：

`{SOCIAL_BINDING_CALLBACK_BASE_URL}/dashboard/connections/social/callback?target=<connectorTarget>`

推荐在以下场景配置：

- 反向代理后端拿到的 `host` 不是最终公网域名
- 本地/容器环境默认会生成 `localhost`，而第三方平台不允许
- 需要固定使用一个可在第三方平台白名单注册的统一域名

---

## 3. 功能配置（config/source/features.yaml）

`features.yaml` 主要包含两部分：

1. `features`：功能开关
2. `profileFields`：个人资料字段显示与编辑策略

### 3.1 常见功能开关

- `features.emailChange.enabled`
- `features.phoneChange.enabled`
- `features.usernameChange.enabled`
- `features.sessions.enabled`
- `features.accountDeletion.enabled`

### 3.2 社交连接器配置

路径：`features.socialIdentities.config.connectors`

每个连接器支持字段：

- `target`：连接器目标标识（如 `google` / `github` / `qq`）
- `connectorId`：Logto 控制台中的 connector ID
- `enabled`：是否展示并允许绑定
- `displayName`：展示名称
- `icon`：图标键
- `description`：描述文案

示例：

```yaml
features:
  socialIdentities:
    enabled: true
    config:
      connectors:
        - target: github
          connectorId: logto_github_connector_id
          enabled: true
          displayName: GitHub
          icon: github
          description: 绑定 GitHub 账号
```

### 3.3 社交绑定 redirect_uri 配置注意事项（重要）

本项目当前采用 **“回调到应用”** 的社交绑定方案。

- 绑定流程会使用：
  - `{应用域名}/dashboard/connections/social/callback?target=<target>`
- 第三方平台必须将该回调地址加入白名单（通常至少要求域名 + 路径精确匹配）
- 若报 `redirect_uri is illegal`，请重点检查：
  - 协议（http/https）是否一致
  - 域名是否一致（含子域）
  - 端口是否一致
  - 路径是否一致（`/dashboard/connections/social/callback`）

建议：生产环境始终使用 HTTPS + 固定域名，并配置 `SOCIAL_BINDING_CALLBACK_BASE_URL` 避免回退到 localhost。

---

## 4. 门户服务配置（config/source/services.yaml）

包括：

- `serviceCategories`：分类定义
- `services`：服务条目

每个服务建议包含：

- `id`（唯一）
- `name`
- `description`
- `icon`（建议放 `/public/services/*.svg`）
- `iconName`
- `href`（必须是合法 URL）
- `category`（必须引用已有分类）
- 可选：`ping`、`isPopular`、`isNew`

---

## 5. 修改后如何生效

### 本地

```bash
npm run config:generate
npm run dev
```

或直接运行 `npm run dev`（会自动生成）。

### Docker

配置文件映射在宿主机后，修改完成执行：

```bash
docker compose restart app
```

容器启动时会自动重新生成配置并构建。

---

## 6. 常见问题

### Q1: 为什么配置改了没生效？

- 确认改的是 `config/source/*.yaml`，不是 `config/generated/*.ts`
- 确认已重新执行 `config:generate` 或重启容器

### Q2: YAML 报错怎么办？

- 检查缩进（统一 2 空格）
- 检查 URL 字段是否为合法 URL
- 检查枚举值/字段名是否拼写正确

### Q3: 社交绑定总是跳 localhost？

优先检查：

1. 是否设置了 `SOCIAL_BINDING_CALLBACK_BASE_URL`
2. 代理是否正确透传 `x-forwarded-host` / `x-forwarded-proto`
3. `BASE_URL_DEV/BASE_URL_PROD` 是否配置为可访问域名
