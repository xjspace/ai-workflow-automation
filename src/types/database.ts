// 数据库类型定义

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, unknown>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: Record<string, unknown>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  user_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error: string | null;
  execution_time_ms: number | null;
  node_executions: NodeExecution[];
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
}

export interface NodeExecution {
  nodeId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output: Record<string, unknown>;
  error?: string;
  duration_ms?: number;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, unknown>;
  thumbnail_url: string | null;
  is_public: boolean;
  use_count: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserUsage {
  id: string;
  user_id: string;
  month: string;
  execution_count: number;
  workflow_count: number;
  created_at: string;
  updated_at: string;
}

// 套餐限制
export const PLAN_LIMITS = {
  free: {
    maxExecutions: 100,
    maxWorkflows: 5,
  },
  pro: {
    maxExecutions: 5000,
    maxWorkflows: -1, // 无限
  },
  team: {
    maxExecutions: 20000,
    maxWorkflows: -1,
  },
} as const;

export type PlanType = keyof typeof PLAN_LIMITS;
