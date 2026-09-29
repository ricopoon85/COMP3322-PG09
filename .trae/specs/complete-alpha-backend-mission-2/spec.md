# 完成 Alpha 版本 Backend Mission 2 Spec

## Why
项目 guideline 要求 Alpha 版本至少完成数据库 schema 与 backend 的连接、部分核心功能的前后端数据库端到端流程，以及相应的前端页面。当前项目已经有用户认证和笔记编辑器外壳，但 Home 页面仍使用 mock notes，notes API、搜索和统一错误处理尚未实现。

## What Changes
- 保留并复用现有 MySQL `users`、`notes` schema 和 JWT 认证 middleware。
- 新增 mission 2 的 note model、controller 和 routes。
- 提供当前登录用户的 notes 列表、单条读取、创建、更新、删除和搜索 REST API。
- 强制每个 note 查询按 JWT 中的 `userId` 隔离，不能读取或修改其他用户的笔记。
- 新增统一错误处理 middleware，并在 `app.js` 接入 note routes 与错误处理。
- 将现有 Home mock notes 替换为真实 API 数据，并让新建、编辑（含现有 500ms autosave）、删除和搜索可端到端工作。
- 为 Alpha 准备可复现的 API、数据库和前端联调验证记录；不在本次范围内实现分享、导入、提醒、格式化或生产部署。

## Impact
- Affected specs: Alpha 版本交付、认证后笔记管理、RESTful API、数据库持久化。
- Affected code: `backend/models/noteModel.js`、`backend/controllers/noteController.js`、`backend/routes/noteRoutes.js`、`backend/middleware/errorHandler.js`、`backend/app.js`，以及 `frontend/src/pages/Home.jsx` 和 API service。
- Existing work acknowledged:
  - Proposal 已定义项目目标、React/Node.js/Express/MySQL 技术栈、must-have/nice-to-have 功能和任务分配。
  - Database 已建立 `users` 与 `notes` 表、外键及时间字段。
  - Frontend 已完成 React/Vite SPA 外壳、登录/注册/Profile 页面、JWT 请求拦截器、Sidebar/Editor UI 和本地 mock CRUD。
  - Backend mission 1 已完成数据库连接、注册、登录、`/auth/me`、JWT route protection、验证和基础错误响应。
  - Backend mission 2 尚待完成 notes CRUD/search、统一错误处理、接入 app，以及 Docker 交付文件（若小组在 Alpha 前要求部署）。

## ADDED Requirements
### Requirement: Authenticated note collection API
系统 SHALL 在 `/api/notes` 下提供受 JWT 保护的 notes collection API。

#### Scenario: List current user's notes
- **WHEN** 已登录用户发送 `GET /api/notes`
- **THEN** 返回 `200`、`success: true` 和该用户自己的 notes 数组，按 `updated_at` 降序排列
- **AND** 未登录或 token 无效时返回 `401`

#### Scenario: Search current user's notes
- **WHEN** 已登录用户发送 `GET /api/notes?search=term`
- **THEN** 只在该用户自己的 title/content 中进行匹配，并返回 `200` 的 notes 数组
- **AND** 空 search 等同于列出该用户全部 notes

#### Scenario: Create note
- **WHEN** 已登录用户发送 `POST /api/notes`，body 包含可选 `title` 和 `content`
- **THEN** 创建 `user_id` 为当前 token 用户的 note，返回 `201` 和完整 note
- **AND** 缺少非法字段或超过数据库允许长度时返回 `400`

### Requirement: Individual note CRUD API
系统 SHALL 在 `/api/notes/:id` 提供受 JWT 保护的单条读取、更新和删除。

#### Scenario: Read, update, or delete owned note
- **WHEN** note id 属于当前用户且请求合法
- **THEN** `GET` 返回 `200`，`PUT/PATCH` 返回 `200` 更新后的 note，`DELETE` 返回 `204` 或约定的 `200`
- **AND** 更新应保存 title/content，数据库自动更新 `updated_at`

#### Scenario: Access another user's or missing note
- **WHEN** note id 不属于当前用户或不存在
- **THEN** 返回统一的 `404`，不得泄露该 note 是否属于其他用户

### Requirement: Error and integration behavior
系统 SHALL 使用统一错误处理 middleware 处理未捕获错误，并保持一致的 JSON 错误结构。

#### Scenario: Unknown route or server error
- **WHEN** 请求不存在的 route 或 backend 发生未处理异常
- **THEN** 分别返回 `404` 或 `500`，body 至少包含 `success: false` 和可供客户端显示的 `error`

#### Scenario: End-to-end Home flow
- **WHEN** 用户登录后打开 Home、创建/选择/编辑/删除或搜索 note
- **THEN** Home 从 backend 读取真实 notes，操作通过 API 持久化到 MySQL，刷新页面后结果仍存在
- **AND** token 失效时前端显示错误并引导重新登录

## MODIFIED Requirements
### Requirement: Alpha deliverable scope
Alpha 版本的可演示核心功能 SHALL 至少包含登录后 notes 的持久化 CRUD 和搜索端到端流程；proposal 中的 sharing、importing 及 nice-to-have 功能可留待 Beta/Final。

## REMOVED Requirements
### Requirement: Local-only mock notes
**Reason**: mock notes 不能满足数据库接入和前后端端到端 Alpha 要求。
**Migration**: Home 保留现有 Sidebar/Editor UI，但数据来源改为 `/api/notes`，并处理 loading、empty、error 状态。
