// Workflow Node Type Definitions

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

// Base Node Data
export interface BaseNodeData {
  label: string;
  description?: string;
}

// Trigger Node
export interface TriggerNodeData extends BaseNodeData {
  type: TriggerType;
  schedule?: string; // cron expression
  webhookPath?: string;
}

// AI Node
export interface AINodeData extends BaseNodeData {
  provider: AIProvider;
  model: string;
  operation: AIOperation;
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

// HTTP Node
export interface HTTPNodeData extends BaseNodeData {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  url: string;
  headers?: Record<string, string>;
  body?: string;
  timeout?: number;
}

// Condition Node
export interface ConditionNodeData extends BaseNodeData {
  expression: string;
  trueLabel?: string;
  falseLabel?: string;
}

// Loop Node
export interface LoopNodeData extends BaseNodeData {
  arrayPath: string;
  itemName: string;
}

// Transform Node
export interface TransformNodeData extends BaseNodeData {
  expression: string;
}

// Node Data Union Type
export type WorkflowNodeData =
  | TriggerNodeData
  | AINodeData
  | HTTPNodeData
  | ConditionNodeData
  | LoopNodeData
  | TransformNodeData;

// Node Configuration Mapping
export const nodeConfig: Record<NodeType, {
  label: string;
  icon: string;
  color: string;
  category: 'trigger' | 'action' | 'logic';
}> = {
  trigger: {
    label: 'Trigger',
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
    label: 'Schedule',
    icon: '⏰',
    color: '#8b5cf6',
    category: 'trigger',
  },
  ai: {
    label: 'AI Process',
    icon: '🤖',
    color: '#10b981',
    category: 'action',
  },
  http: {
    label: 'HTTP Request',
    icon: '🌐',
    color: '#6366f1',
    category: 'action',
  },
  condition: {
    label: 'Condition',
    icon: '🔀',
    color: '#f97316',
    category: 'logic',
  },
  loop: {
    label: 'Loop',
    icon: '🔄',
    color: '#ec4899',
    category: 'logic',
  },
  transform: {
    label: 'Transform',
    icon: '🔧',
    color: '#14b8a6',
    category: 'action',
  },
};

// Workflow Definition
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
