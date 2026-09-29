# Tasks

- [x] Task 1: 确认 Alpha 基线与本地环境
  - [x] 1.1 核对 `database/schema.sql`、`.env.example`、MySQL 连接和现有 JWT 配置。
  - [x] 1.2 用现有注册、登录、`/auth/me` 流程建立一个可测试用户，并记录启动命令。

- [x] Task 2: 实现 note model 和数据库查询
  - [x] 2.1 创建 `noteModel.js`，实现按 `user_id` 的 list、find、create、update、delete。
  - [x] 2.2 实现 title/content 搜索；所有 SQL 使用参数绑定。
  - [x] 2.3 统一返回字段并按 `updated_at` 降序排列。

- [x] Task 3: 实现 note controller、routes 和验证
  - [x] 3.1 创建 `noteController.js`，实现 list/search、get one、create、update、delete。
  - [x] 3.2 创建 `noteRoutes.js`，所有 routes 使用 `authMiddleware`。
  - [x] 3.3 对 id、title、content 和 query 参数进行基本输入验证，并使用合适 HTTP status code。
  - [x] 3.4 确保不存在/非本人 note 统一返回 `404`。

- [x] Task 4: 接入统一错误处理
  - [x] 4.1 创建 `middleware/errorHandler.js`，统一输出 `{ success: false, error }`。
  - [x] 4.2 在 `app.js` 挂载 `/api/notes` 和 error handler，保留 health check、auth routes 和 404 handler。

- [x] Task 5: 将 Home 接入 notes API
  - [x] 5.1 新增或扩展 frontend API service，调用 list/create/update/delete/search。
  - [x] 5.2 Home 初次加载从 API 获取当前用户 notes，并处理 loading、空列表和请求错误。
  - [x] 5.3 将新建、删除、标题/内容 autosave 改为 API 操作，避免仅更新 local state。
  - [x] 5.4 添加最小搜索输入和结果刷新行为；保持现有 Sidebar/Editor 交互。

  - [ ] Task 6: 端到端验证与 Alpha 交付
  - [ ] 6.1 使用两个用户验证注册、登录、CRUD、搜索、401、404 和用户数据隔离。
    - 当前环境阻塞：`node`/`npm` 不在 PATH，仓库也没有 `backend/.env`；MySQL 无密码连接返回 `ERROR 1045 (28000)`，因此无法启动 backend 或执行真实 API 验证。
  - [ ] 6.2 验证刷新页面后 note 持久化，确认 frontend build/lint 与 backend 启动无错误。
    - 当前环境阻塞：`node`/`npm` 不在 PATH，`frontend/node_modules` 和 `backend/node_modules` 也不存在；无法执行 build、lint 或 backend 启动检查。
  - [x] 6.3 更新必要的运行说明和 `.env.example`，确认没有提交真实 secrets。
  - [ ] 6.4 提交并 push Alpha 源码，按课程要求创建 Alpha tag，并准备 interview 演示路径。
    - 本次按用户要求不提交、不 push、也不创建 tag；该项保持未验证。
  - [x] 6.5 修复 notes 更新无变化时的响应、统一错误状态码识别和 health 数据库探针。

### Task 6 verification record

- 2026-09-29: `node --version` 和 `npm --version` 均失败，系统找不到命令；因此未运行 frontend build/lint 或 backend。
- 2026-09-29: `mysql.exe --connect-timeout=3 -u root -e "SELECT 1;"` 返回
  `ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)`；
  没有使用或猜测密码，故未执行 schema、health、认证或 notes API 验证。
- 2026-09-29: `backend/.env`、两个 `node_modules` 目录均不存在；只发现
  `backend/.env.example`，并确认 `.gitignore` 忽略 `.env`/`.env.*` 且保留 `.env.example`。
- 因上述阻塞，没有为未实际执行的端到端、持久化、build/lint 或 Alpha 交付项目勾选完成。

# Task Dependencies

- Task 2 depends on Task 1.
- Task 3 depends on Task 2.
- Task 4 depends on Task 3.
- Task 5 depends on Task 3 and Task 4.
- Task 6 depends on Task 5.

# Existing Work Summary

- Proposal: 已完成项目描述、目标用户、must-have/nice-to-have、技术栈、workflow 和任务分配；需注意文件在仓库根目录，而 guideline 原文要求 proposal folder。
- Database: `schema.sql` 已有 `users`、`notes`、外键和 timestamps；本 mission 不应重复设计认证表。
- Frontend: 已有 React/Vite SPA、Login/Register/Profile、JWT axios interceptor、Sidebar、Editor 和本地 mock CRUD；Home 是主要替换点。
- Backend Mission 1: 已有 MySQL pool、注册/登录/`/me`、bcrypt、JWT、validator、auth middleware、CORS、health check 和基础 404/500 响应。
- Backend Mission 2: 尚缺 note model/controller/routes、search、统一 errorHandler、app 接线，以及 notes 的真实前端联调。
