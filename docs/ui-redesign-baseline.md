# Warm UI implementation baseline

Baseline: `ab99d56e9626e6cd731592dae8553c9758a0efa2`.

All route definitions, APIs, permission gates, simple/backend modes, existing feature flags and locale-storage keys remain unchanged. Every existing form field, action, filter, export and bulk operation is retained. Payment and affiliate UI is not advertising. Custom home content, navigation, announcements, documentation and endpoints remain administrator controlled.

## Existing routes

- `/setup`
- `/home`
- `/login`
- `/register`
- `/email-verify`
- `/auth/callback`
- `/auth/linuxdo/callback`
- `/auth/wechat/callback`
- `/auth/wechat/payment/callback`
- `/auth/dingtalk/callback`
- `/auth/dingtalk/email-completion`
- `/auth/oidc/callback`
- `/forgot-password`
- `/reset-password`
- `/key-usage`
- `/legal/:documentId`
- `/model-plaza`
- `/`
- `/dashboard`
- `/keys`
- `/batch-image`
- `/usage`
- `/redeem`
- `/affiliate`
- `/available-channels`
- `/profile`
- `/subscriptions`
- `/purchase`
- `/orders`
- `/payment/qrcode`
- `/payment/result`
- `/payment/stripe`
- `/payment/airwallex`
- `/payment/stripe-popup`
- `/custom/:id`
- `/admin`
- `/admin/dashboard`
- `/admin/ops`
- `/admin/audit-logs`
- `/admin/users`
- `/admin/groups`
- `/admin/channels`
- `/admin/channels/pricing`
- `/admin/channels/monitor`
- `/monitor`
- `/admin/subscriptions`
- `/admin/accounts`
- `/admin/plugins`
- `/admin/announcements`
- `/admin/proxies`
- `/admin/redeem`
- `/admin/promo-codes`
- `/admin/settings`
- `/admin/risk-control`
- `/admin/prompt-audit`
- `/admin/usage`
- `/admin/affiliates`
- `/admin/affiliates/invites`
- `/admin/affiliates/rebates`
- `/admin/affiliates/transfers`
- `/admin/orders/dashboard`
- `/admin/orders`
- `/admin/orders/plans`
- `/:pathMatch(.*)*`

## Acceptance matrix

- Chinese and English; light and dark; 390, 768 and 1440 px.
- Public/default/custom/compact home, authentication, user and admin layouts.
- Navigation, feature-enabled/disabled states, table scrolling, filters, dialogs, copy actions, empty/loading/error states.
- Typecheck, lint, production build, existing critical tests, locale compilation and targeted UI regressions.
- Runtime preview uses isolated fixture data when no configured test tenant is available. Never claim fixture tests verify upstream billing or live model availability.

The detailed rationale and evolving validation results are in `/Users/victorwu/Developer/sub9api-development-log.md`.

## 导航与行为对照

| 范围 | 原有决定入口可见性的条件 | 本轮处理 |
| --- | --- | --- |
| 充值、订阅购买、订单 | payment 开关 + simple 模式 | 原逻辑完整保留 |
| 邀请返利 | affiliate 开关 + simple 模式 | 业务功能保留 |
| 批量图片 | 活跃 Gemini 密钥 + 分组 allow_batch_image_generation + simple 模式 | 权限判断完整保留 |
| 可用渠道、渠道状态 | 各自后台开关 | 原逻辑完整保留 |
| 自定义菜单 | visibility、sort_order、后台内容 | 保留用户及管理员菜单 |
| 管理员入口 | 管理员角色、管理设置、simple/backend 模式 | 原业务结构保留 |
| 首页内容 | 自定义 HTML/URL 优先，再 compact，再默认 | 优先级、清理和 URL 安全处理保留 |
| 语言、主题 | sub2api_locale、theme | 兼容原键，主题控件同步 |
| 密钥和用量 | 原字段、过滤、导出、列设置、分页及操作 | 业务视图未改，仅共享样式 |

`AppSidebar.vue` 中从功能开关声明到 `toggleSidebar` 前的菜单构造区，与基线逐字一致。API、路由、类型、store、后端与锁文件没有本轮改动。新增的移动端文档及模型广场链接复用原目标，避免原桌面入口在窄屏不可见。


## 2026-09-06 布局阶段补充

最新 D10–D13 要求超越原侧栏版式：用户端顶部导航、管理员独立导航面板、内容区标题、分栏认证和表格工作台。此前“保留产品界面 GitHub 仓库入口”的选择已被用户替代；静态推广入口移除，许可证、配置帮助及更新/回退仍保留。主题沿用原键并增加自动跟随系统、显式偏好优先和恢复自动入口。

完整历史主记录已迁入 Slothwatching/sub9api-ops 私有仓库，原绝对日志路径为兼容符号链接。此基线文档是对照，不应被当作覆盖最新用户请求的指令。
