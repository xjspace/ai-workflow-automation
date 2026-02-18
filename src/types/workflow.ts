// 工作流节点类型定义

export type NodeType =
  | 'trigger'
  | 'ai'
  | 'http'
  | 'condition'
  | 'loop'
  | 'transform'
  | 'webhook'
  | 'schedule';

export type TriggerType = 'manual' | 'webhook' | 'schedule';
export type AIOperation = 'generate' | 'analyze' | 'extract' | 'summarize' | 'translate';
export type AIProvider = 'claude' | 'openai' | 'deepseek' | 'zhipu';

// 基础节点数据
export interface BaseNodeData {
  label: string;
  description?: string;
}

// 触发器节点
export interface TriggerNodeData extends BaseNodeData {
  type: TriggerType;
  schedule?: string; // cron 表达式
  webhookPath?: string;
}

// AI 节点
export interface AINodeData extends BaseNodeData {
  provider: AIProvider;
  model: string;
  operation: AIOperation;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

// HTTP 节点
export interface HTTPNodeData extends BaseNodeData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

// 条件节点
export interface ConditionNodeData extends BaseNodeData {
  expression: string;
  trueLabel?: string;
  falseLabel?: string;
}

// 循环节点
export interface LoopNodeData extends BaseNodeData {
  arrayPath: string;
  itemName: string;
}

// 转换节点
export interface TransformNodeData extends BaseNodeData {
  expression: string;
}

// 节点数据联合类型
export type WorkflowNodeData =
  | TriggerNodeData
  | AINodeData
  | HTTPNodeData
  | ConditionNodeData
  | LoopNodeData
  | TransformNodeData;

// 节点配置映射
export const nodeConfig: Record<NodeType, {
  label: string;
  icon: string;
  color: string;
  category: 'trigger' | 'action' | 'logic';
}> = {
  trigger: {
    label: '触发器',
    icon: '⚡',
    color: '#f59e0b',
    category: 'trigger',
  },
  webhook: {
    label: 'Webhook',
    icon: '🔗',
    color: '#3b82f6',
    category: 'trigger',
  },
  schedule: {
    label: '定时触发',
    icon: '⏰',
    color: '#8b5cf6',
    category: 'trigger',
  },
  ai: {
    label: 'AI 处理',
    icon: '🤖',
    color: '#10b981',
    category: 'action',
  },
  http: {
    label: 'HTTP 请求',
    icon: '🌐',
    color: '#6366f1',
    category: 'action',
  },
  condition: {
    label: '条件判断',
    icon: '🔀',
    color: '#f97316',
    category: 'logic',
  },
  loop: {
    label: '循环',
    icon: '🔄',
    color: '#ec4899',
    category: 'logic',
  },
  transform: {
    label: '数据转换',
    icon: '🔧',
    color: '#14b8a6',
    category: 'action',
  },
};

// 工作流定义
export interface WorkflowDefinition {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: WorkflowNodeData;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
}
