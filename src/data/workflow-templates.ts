import type { WorkflowDefinition } from '@/types/workflow';

// 预置模板
export const workflowTemplates: Partial<WorkflowDefinition>[] = [
  {
    name: 'AI 文本生成',
    description: '使用 AI 生成文本内容',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: '开始',
          type: 'manual',
        },
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 350, y: 200 },
        data: {
          label: 'AI 生成',
          provider: 'claude',
          model: 'claude-3-5-sonnet-20241022',
          operation: 'generate',
          prompt: '请根据以下主题生成一篇文章：{{input.topic}}',
          temperature: 0.7,
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'trigger-1', target: 'ai-1' },
    ],
  },

  {
    name: 'HTTP 数据获取',
    description: '从 API 获取数据并处理',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: '开始',
          type: 'manual',
        },
      },
      {
        id: 'http-1',
        type: 'http',
        position: { x: 350, y: 200 },
        data: {
          label: '获取数据',
          method: 'GET',
          url: 'https://api.example.com/data',
        },
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 600, y: 200 },
        data: {
          label: '提取字段',
          expression: 'nodeOutputs["http-1"].data',
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'trigger-1', target: 'http-1' },
      { id: 'edge-2', source: 'http-1', target: 'transform-1' },
    ],
  },

  {
    name: 'AI 内容分析',
    description: '使用 AI 分析文本内容',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: '开始',
          type: 'manual',
        },
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 350, y: 200 },
        data: {
          label: '情感分析',
          provider: 'claude',
          model: 'claude-3-5-sonnet-20241022',
          operation: 'analyze',
          prompt: '请分析以下文本的情感倾向（正面/负面/中性），并给出理由：\n\n{{input.text}}',
          temperature: 0.3,
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'trigger-1', target: 'ai-1' },
    ],
  },

  {
    name: '条件分支处理',
    description: '根据条件执行不同分支',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: '开始',
          type: 'manual',
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 350, y: 200 },
        data: {
          label: '判断',
          expression: 'input.score > 60',
        },
      },
      {
        id: 'ai-pass',
        type: 'ai',
        position: { x: 600, y: 100 },
        data: {
          label: '通过处理',
          provider: 'claude',
          model: 'claude-3-5-sonnet-20241022',
          operation: 'generate',
          prompt: '恭喜通过！分数：{{input.score}}',
          temperature: 0.7,
        },
      },
      {
        id: 'ai-fail',
        type: 'ai',
        position: { x: 600, y: 300 },
        data: {
          label: '未通过处理',
          provider: 'claude',
          model: 'claude-3-5-sonnet-20241022',
          operation: 'generate',
          prompt: '很遗憾未通过，分数：{{input.score}}。请继续努力！',
          temperature: 0.7,
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'trigger-1', target: 'condition-1' },
      { id: 'edge-2', source: 'condition-1', target: 'ai-pass', sourceHandle: 'true' },
      { id: 'edge-3', source: 'condition-1', target: 'ai-fail', sourceHandle: 'false' },
    ],
  },

  {
    name: '定时 Webhook',
    description: '定时触发并调用 Webhook',
    nodes: [
      {
        id: 'schedule-1',
        type: 'schedule',
        position: { x: 100, y: 200 },
        data: {
          label: '每日定时',
          type: 'schedule',
          schedule: '0 9 * * *',
        },
      },
      {
        id: 'http-1',
        type: 'http',
        position: { x: 350, y: 200 },
        data: {
          label: '发送通知',
          method: 'POST',
          url: 'https://hooks.example.com/notify',
          body: '{"event": "daily_report"}',
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'schedule-1', target: 'http-1' },
    ],
  },
];

// 获取模板列表
export function getTemplateList() {
  return workflowTemplates.map((t, i) => ({
    id: `template-${i}`,
    name: t.name,
    description: t.description,
    nodeCount: t.nodes?.length || 0,
  }));
}

// 根据 ID 获取模板
export function getTemplateById(id: string) {
  const index = parseInt(id.replace('template-', ''));
  return workflowTemplates[index] || null;
}
