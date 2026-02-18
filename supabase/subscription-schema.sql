-- AI Workflow Automation - 数据库表结构
-- 在 Supabase SQL Editor 中执行此脚本

-- ============================================
-- 1. 订阅表 (subscriptions)
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL DEFAULT 'free',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_period_end TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 month'),
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  payment_provider VARCHAR(50) DEFAULT 'mock',
  customer_id VARCHAR(255),
  subscription_id VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_plan CHECK (plan IN ('free', 'pro', 'team', 'enterprise')),
  CONSTRAINT valid_status CHECK (status IN ('active', 'canceled', 'past_due', 'expired', 'trialing'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- 每个用户只能有一个活跃订阅
CREATE UNIQUE INDEX IF NOT EXISTS idx_subscriptions_user_active
  ON subscriptions(user_id)
  WHERE status = 'active';

-- ============================================
-- 2. 订单表 (orders)
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  plan VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_provider VARCHAR(50) DEFAULT 'mock',
  payment_id VARCHAR(255),
  invoice_url TEXT,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_order_status CHECK (status IN ('pending', 'paid', 'failed', 'refunded', 'canceled')),
  CONSTRAINT valid_order_plan CHECK (plan IN ('free', 'pro', 'team', 'enterprise'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- ============================================
-- 3. 发票表 (invoices)
-- ============================================
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  number VARCHAR(50) NOT NULL UNIQUE,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'open',
  due_date TIMESTAMPTZ NOT NULL,
  paid_at TIMESTAMPTZ,
  invoice_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_invoice_status CHECK (status IN ('draft', 'open', 'paid', 'void'))
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);

-- ============================================
-- 4. 使用量统计表 (usage_stats)
-- ============================================
CREATE TABLE IF NOT EXISTS usage_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period VARCHAR(10) NOT NULL, -- YYYY-MM format
  workflow_count INTEGER NOT NULL DEFAULT 0,
  execution_count INTEGER NOT NULL DEFAULT 0,
  ai_credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT unique_user_period UNIQUE (user_id, period)
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_period ON usage_stats(period);

-- ============================================
-- 5. 触发器：自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 应用触发器
DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_usage_stats_updated_at ON usage_stats;
CREATE TRIGGER update_usage_stats_updated_at
  BEFORE UPDATE ON usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 6. RLS (Row Level Security) 策略
-- ============================================
-- 启用 RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- 订阅表策略
CREATE POLICY "用户可以查看自己的订阅"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "服务角色可以管理所有订阅"
  ON subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- 订单表策略
CREATE POLICY "用户可以查看自己的订单"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "服务角色可以管理所有订单"
  ON orders FOR ALL
  USING (auth.role() = 'service_role');

-- 发票表策略
CREATE POLICY "用户可以查看自己的发票"
  ON invoices FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "服务角色可以管理所有发票"
  ON invoices FOR ALL
  USING (auth.role() = 'service_role');

-- 使用量表策略
CREATE POLICY "用户可以查看自己的使用量"
  ON usage_stats FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "服务角色可以管理所有使用量"
  ON usage_stats FOR ALL
  USING (auth.role() = 'service_role');

-- ============================================
-- 7. 初始化数据（可选）
-- ============================================
-- 为现有用户创建免费订阅（如果不存在）
INSERT INTO subscriptions (user_id, plan, status)
SELECT id, 'free', 'active'
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions WHERE user_id = auth.users.id AND status = 'active'
);

-- ============================================
-- 完成！
-- ============================================
-- 执行完成后，你的数据库将具备：
-- ✓ 订阅管理
-- ✓ 订单记录
-- ✓ 发票管理
-- ✓ 使用量追踪
-- ✓ 安全的 RLS 策略
