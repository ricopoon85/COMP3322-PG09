# Alpha Verification Checklist

- [x] Proposal 的项目目标、用户、must-have/nice-to-have、技术栈和任务分配可从仓库材料中说明。
- [ ] MySQL schema 可成功建立 `notes_app`、`users`、`notes`，并执行外键约束。
- [ ] Backend 能连接 MySQL，`/api/health` 返回 `200`。
- [ ] 注册、登录和 `/api/auth/me` 在有效输入下工作；密码不以明文保存。
- [ ] 没有 token 访问 `/api/notes` 返回 `401`；无效/过期 token 也返回 `401`。
- [ ] `GET /api/notes` 只返回当前用户的 notes，并按最近更新时间排序。
- [ ] `GET /api/notes?search=term` 能匹配当前用户的 title/content，且不会返回别人的数据。
- [ ] `POST /api/notes` 能持久化新 note，并返回 `201` 和 note id。
- [ ] `GET/PATCH(or PUT)/DELETE /api/notes/:id` 对本人 note 成功，并更新 `updated_at`。
- [ ] 访问不存在或属于其他用户的 note 统一返回 `404`。
- [ ] 非法输入返回 `400`；未知 route 返回 `404`；未处理错误返回 `500`，格式一致。
- [ ] Home 页面不再依赖 `MOCK_NOTES`，能够显示 API notes、空状态和错误状态。
- [ ] Home 新建、编辑 autosave、删除、搜索经过 API 后刷新仍保持结果。
- [ ] frontend production build/lint 和 backend 启动检查通过。
- [x] `.env`/真实凭据未提交，`.env.example` 足够说明必要变量。
- [ ] Alpha 代码已提交、push 并按课程要求打 tag，且能按演示路径说明自己负责的 backend 代码。

## Blocked Verification

2026-09-29：当前环境没有 `node`/`npm`，且 frontend/backend 的 `node_modules`
均不存在；仓库没有 `backend/.env`。使用已安装的 MySQL client 执行无密码连接时返回
`ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)`。
因此 schema、backend health、认证、notes API、前端 build/lint 和刷新持久化均未执行，
相关项目保持未勾选。根据用户要求，本次也未提交、push 或创建 Alpha tag。
