# 部署指南

## 1. Supabase 配置

### 1.1 创建 Supabase 项目

1. 访问 [Supabase](https://supabase.com) 并登录
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - Name: `ai-workflow-automation`
   - Database Password: 设置强密码
   - Region: 选择 `Southeast Asia (Singapore)` 或最近的区域

### 1.2 执行数据库 Schema

1. 进入项目后，点击左侧 "SQL Editor"
2. 点击 "New query"
3. 复制 `supabase/schema.sql` 的全部内容
4. 点击 "Run" 执行

### 1.3 获取 API 密钥

1. 点击左侧 "Settings" → "API"
2. 复制以下值：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (点击 Reveal 显示)

### 1.4 配置认证

1. 点击左侧 "Authentication" → "Providers"
2. 确保 "Email" 已启用
3. 可选：配置第三方登录（Google、GitHub 等）

## 2. Vercel 部署

### 2.1 连接 GitHub

1. 访问 [Vercel](https://vercel.com) 并登录
2. 点击 "Add New..." → "Project"
3. 选择 "Import Git Repository"
4. 授权并选择 `ai-workflow-automation` 仓库

### 2.2 配置环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量名 | 值 | 环境 |
|--------|-----|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Production, Preview |
| `ANTHROPIC_API_KEY` | Claude API Key | Production, Preview (可选) |
| `OPENAI_API_KEY` | OpenAI API Key | Production, Preview (可选) |
| `DEEPSEEK_API_KEY` | DeepSeek API Key | Production, Preview (可选) |
| `ZHIPU_API_KEY` | 智谱 API Key | Production, Preview (可选) |

### 2.3 部署配置

- **Framework Preset**: Next.js
- **Root Directory**: `./`
- **Build Command**: `pnpm build`
- **Output Directory**: `.next`
- **Install Command**: `pnpm install`

### 2.4 触发部署

1. 点击 "Deploy"
2. 等待构建完成
3. 访问分配的 `.vercel.app` 域名验证

## 3. 域名配置

### 3.1 添加自定义域名

1. 在 Vercel 项目中，点击 "Settings" → "Domains"
2. 输入 `takeovers.work` 并添加
3. 选择推荐配置（通常是 CNAME）

### 3.2 DNS 配置

在域名注册商处添加 DNS 记录：

**对于 `takeovers.work` (根域名):**
- 类型: `A`
- 名称: `@`
- 值: `76.76.21.21` (Vercel IP)

**对于 `www.takeovers.work`:**
- 类型: `CNAME`
- 名称: `www`
- 值: `cname.vercel-dns.com`

### 3.3 等待生效

- DNS 生效时间: 5-30 分钟
- SSL 证书: Vercel 自动配置

## 4. 部署后验证

### 4.1 功能检查清单

- [ ] Landing Page 正常显示 (`/`)
- [ ] 登录/注册功能 (`/auth/login`)
- [ ] 工作流编辑器 (`/dashboard`)
- [ ] API 端点响应正常 (`/api/workflows`)
- [ ] 模板 API 响应正常 (`/api/templates`)

### 4.2 监控配置

1. Vercel Analytics: 在项目设置中启用
2. 错误追踪: 查看 Vercel Dashboard → Logs
3. 性能监控: Vercel Speed Insights

## 5. 故障排查

### 常见问题

**Q: 构建失败 - 找不到模块**
```
A: 检查 pnpm-lock.yaml 是否提交，运行 pnpm install
```

**Q: API 返回 500 错误**
```
A: 检查 Supabase 环境变量是否正确配置
```

**Q: 认证不工作**
```
A: 检查 Supabase URL 和 Key 是否正确
   确认 Site URL 在 Supabase Auth 设置中已配置
```

**Q: 数据库操作失败**
```
A: 确认 SQL Schema 已执行
   检查 RLS 策略是否正确
```

## 6. CI/CD 配置

项目已配置自动部署：
- **main 分支** → Production 部署
- **Pull Request** → Preview 部署

---

*最后更新: 2026-02-18*
