# AI Workflow Automation

> AI 原生的工作流自动化平台 - 让 AI 为你工作

## 概述

AI Workflow Automation 是一个现代化的工作流自动化 SaaS 平台，支持可视化工作流编排、AI 节点集成和多平台连接。

## 功能特性

### 核心功能
- 🔄 **可视化工作流编辑器** - 拖拽式工作流编排
- 🤖 **AI 节点集成** - 支持多种 AI 模型（Claude、OpenAI、DeepSeek、智谱）
- 🔗 **多平台连接** - 支持微信、钉钉、飞书、邮件等
- 📊 **执行监控** - 实时查看工作流执行状态

### 订阅计划

| 计划 | 价格 | 工作流 | 月执行次数 | AI 额度 |
|------|------|--------|-----------|---------|
| Free | $0 | 5 | 100 | 1,000 |
| Pro | $29/月 | 无限 | 5,000 | 50,000 |
| Team | $99/月 | 无限 | 25,000 | 250,000 |
| Enterprise | 定制 | 无限 | 无限 | 无限 |

## 技术栈

- **前端**: Next.js 16 (App Router)、React 19、TypeScript、Tailwind CSS
- **后端**: Next.js API Routes、Server Actions
- **数据库**: Supabase (PostgreSQL + RLS)
- **认证**: Supabase Auth (OAuth + Email)
- **支付**: LemonSqueezy / PayPal
- **AI**: Anthropic Claude、OpenAI、DeepSeek、智谱 AI

## 快速开始

### 环境要求

- Node.js 18+
- pnpm 8+
- Supabase 账户

### 安装

```bash
# 克隆仓库
git clone https://github.com/your-org/ai-workflow-automation.git
cd ai-workflow-automation

# 安装依赖
pnpm install

# 复制环境变量
cp .env.example .env.local

# 配置环境变量（编辑 .env.local）
```

### 环境变量配置

```bash
# AI 服务（至少配置一个）
ANTHROPIC_API_KEY=your-anthropic-api-key
OPENAI_API_KEY=your-openai-api-key
DEEPSEEK_API_KEY=your-deepseek-api-key
ZHIPU_API_KEY=your-zhipu-api-key

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 应用
NEXT_PUBLIC_APP_URL=http://localhost:3000

# 支付（可选）
LEMONSQUEEZY_API_KEY=your-lemonsqueezy-api-key
LEMONSQUEEZY_STORE_ID=your-store-id
LEMONSQUEEZY_WEBHOOK_SECRET=your-webhook-secret
```

### 数据库设置

在 Supabase SQL Editor 中执行：

```bash
# 执行数据库 Schema
supabase/subscription-schema.sql
```

### 开发

```bash
# 启动开发服务器
pnpm dev

# 访问 http://localhost:3000
```

### 构建

```bash
# 生产构建
pnpm build

# 启动生产服务器
pnpm start
```

## 项目结构

```
ai-workflow-automation/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (marketing)/        # 营销页面（首页、定价）
│   │   ├── auth/               # 认证页面（登录、注册）
│   │   ├── dashboard/          # 用户仪表盘
│   │   └── api/                # API 路由
│   ├── components/             # React 组件
│   │   ├── ui/                 # 基础 UI 组件
│   │   ├── workflow/           # 工作流编辑器组件
│   │   └── layout/             # 布局组件
│   ├── lib/                    # 工具库
│   │   ├── supabase.ts         # Supabase 客户端
│   │   ├── subscription-service.ts  # 订阅服务
│   │   └── payment-service.ts  # 支付服务
│   └── types/                  # TypeScript 类型定义
├── public/                     # 静态资源
├── supabase/                   # 数据库 Schema
└── docs/                       # 文档
```

## 部署

### Vercel（推荐）

```bash
# 安装 Vercel CLI
pnpm i -g vercel

# 部署
vercel
```

### 自托管

```bash
# 构建 Docker 镜像
docker build -t ai-workflow-automation .

# 运行容器
docker run -p 3000:3000 --env-file .env.local ai-workflow-automation
```

## 国际化

支持语言：
- 🇺🇸 English (en)
- 🇨🇳 简体中文 (zh)

## 许可证

**Proprietary - All Rights Reserved**

本软件为专有软件，未经授权禁止复制、修改、分发或使用。

---

© 2026 AI Workflow Automation. All rights reserved.
