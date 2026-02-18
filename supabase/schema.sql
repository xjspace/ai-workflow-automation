-- AI Workflow Automation 数据库 Schema
-- 运行方式: 在 Supabase SQL Editor 中执行

-- ============================================
-- 1. 工作流表
-- ============================================
CREATE TABLE IF NOT EXISTS workflows (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  variables JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_workflows_user_id ON workflows(user_id);
CREATE INDEX IF NOT EXISTS idx_workflows_created_at ON workflows(created_at DESC);

-- ============================================
-- 2. 工作流执行历史表
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_executions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  workflow_id UUID REFERENCES workflows(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  input JSONB DEFAULT '{}',
  output JSONB DEFAULT '{}',
  error TEXT,
  execution_time_ms INTEGER,
  node_executions JSONB DEFAULT '[]', -- 每个节点的执行结果
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_executions_workflow_id ON workflow_executions(workflow_id);
CREATE INDEX IF NOT EXISTS idx_executions_user_id ON workflow_executions(user_id);
CREATE INDEX IF NOT EXISTS idx_executions_status ON workflow_executions(status);
CREATE INDEX IF NOT EXISTS idx_executions_created_at ON workflow_executions(created_at DESC);

-- ============================================
-- 3. 模板表 (公开模板)
-- ============================================
CREATE TABLE IF NOT EXISTS workflow_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  nodes JSONB NOT NULL DEFAULT '[]',
  edges JSONB NOT NULL DEFAULT '[]',
  variables JSONB DEFAULT '{}',
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_templates_category ON workflow_templates(category);
CREATE INDEX IF NOT EXISTS idx_templates_public ON workflow_templates(is_public);
CREATE INDEX IF NOT EXISTS idx_templates_use_count ON workflow_templates(use_count DESC);

-- ============================================
-- 4. 用户使用量统计表
-- ============================================
CREATE TABLE IF NOT EXISTS user_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  month VARCHAR(7) NOT NULL, -- YYYY-MM 格式
  execution_count INTEGER DEFAULT 0,
  workflow_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_usage_user_month ON user_usage(user_id, month);

-- ============================================
-- 5. RLS (Row Level Security) 策略
-- ============================================

-- 启用 RLS
ALTER TABLE workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_usage ENABLE ROW LEVEL SECURITY;

-- 工作流: 用户只能访问自己的工作流
CREATE POLICY "Users can view own workflows" ON workflows
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workflows" ON workflows
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workflows" ON workflows
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workflows" ON workflows
  FOR DELETE USING (auth.uid() = user_id);

-- 执行历史: 用户只能访问自己的执行记录
CREATE POLICY "Users can view own executions" ON workflow_executions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own executions" ON workflow_executions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 模板: 所有人可以查看公开模板
CREATE POLICY "Anyone can view public templates" ON workflow_templates
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can manage own templates" ON workflow_templates
  FOR ALL USING (auth.uid() = created_by);

-- 使用量: 用户只能查看自己的使用量
CREATE POLICY "Users can view own usage" ON user_usage
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own usage" ON user_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own usage" ON user_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 6. 触发器: 自动更新 updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_workflows_updated_at
  BEFORE UPDATE ON workflows
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON workflow_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_updated_at
  BEFORE UPDATE ON user_usage
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. 初始化预置模板
-- ============================================
INSERT INTO workflow_templates (name, description, category, nodes, edges, variables) VALUES
('AI 文本生成', '使用 AI 生成文本内容', 'AI',
  '[{"id":"input","type":"input","position":{"x":100,"y":100},"data":{"label":"输入提示词"}},{"id":"ai","type":"ai","position":{"x":300,"y":100},"data":{"label":"AI 生成","model":"claude","prompt":""}},{"id":"output","type":"output","position":{"x":500,"y":100},"data":{"label":"输出结果"}}]',
  '[{"id":"e1","source":"input","target":"ai"},{"id":"e2","source":"ai","target":"output"}]',
  '{}'
),
('HTTP 数据获取', '从 API 获取数据并处理', '数据',
  '[{"id":"trigger","type":"trigger","position":{"x":100,"y":100},"data":{"label":"触发器"}},{"id":"http","type":"http","position":{"x":300,"y":100},"data":{"label":"HTTP 请求","method":"GET","url":""}},{"id":"transform","type":"transform","position":{"x":500,"y":100},"data":{"label":"数据转换"}},{"id":"output","type":"output","position":{"x":700,"y":100},"data":{"label":"输出结果"}}]',
  '[{"id":"e1","source":"trigger","target":"http"},{"id":"e2","source":"http","target":"transform"},{"id":"e3","source":"transform","target":"output"}]',
  '{}'
),
('内容分析流程', '分析文本内容并生成报告', 'AI',
  '[{"id":"input","type":"input","position":{"x":100,"y":100},"data":{"label":"输入文本"}},{"id":"ai1","type":"ai","position":{"x":300,"y":50},"data":{"label":"情感分析","model":"claude"}},{"id":"ai2","type":"ai","position":{"x":300,"y":150},"data":{"label":"关键词提取","model":"claude"}},{"id":"merge","type":"transform","position":{"x":500,"y":100},"data":{"label":"合并结果"}},{"id":"output","type":"output","position":{"x":700,"y":100},"data":{"label":"分析报告"}}]',
  '[{"id":"e1","source":"input","target":"ai1"},{"id":"e2","source":"input","target":"ai2"},{"id":"e3","source":"ai1","target":"merge"},{"id":"e4","source":"ai2","target":"merge"},{"id":"e5","source":"merge","target":"output"}]',
  '{}'
);

-- ============================================
-- 完成
-- ============================================
-- Schema 创建完成!
-- 请确保在 Supabase 控制台中执行此 SQL
