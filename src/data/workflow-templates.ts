import type { WorkflowDefinition } from '@/types/workflow';

// Pre-built templates
export const workflowTemplates: Partial<WorkflowDefinition>[] = [
  {
    name: 'AI Text Generation',
    description: 'Generate text content using AI',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: 'Start',
          type: 'manual',
        },
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 350, y: 200 },
        data: {
          label: 'AI Generate',
          provider: 'claude',
          model: 'claude-3-5-sonnet-20241022',
          operation: 'generate',
          prompt: 'Generate an article based on the following topic: {{input.topic}}',
          temperature: 0.7,
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'trigger-1', target: 'ai-1' },
    ],
  },

  {
    name: 'HTTP Data Fetch',
    description: 'Fetch and process data from API',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: 'Start',
          type: 'manual',
        },
      },
      {
        id: 'http-1',
        type: 'http',
        position: { x: 350, y: 200 },
        data: {
          label: 'Fetch Data',
          method: 'GET',
          url: 'https://api.example.com/data',
        },
      },
      {
        id: 'transform-1',
        type: 'transform',
        position: { x: 600, y: 200 },
        data: {
          label: 'Extract Fields',
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
    name: 'AI Content Analysis',
    description: 'Analyze text content using AI',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: 'Start',
          type: 'manual',
        },
      },
      {
        id: 'ai-1',
        type: 'ai',
        position: { x: 350, y: 200 },
        data: {
          label: 'Sentiment Analysis',
          provider: 'claude',
          model: 'claude-3-5-sonnet-20241022',
          operation: 'analyze',
          prompt: 'Analyze the sentiment of the following text (positive/negative/neutral) and explain why:\n\n{{input.text}}',
          temperature: 0.3,
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'trigger-1', target: 'ai-1' },
    ],
  },

  {
    name: 'Conditional Branching',
    description: 'Execute different branches based on conditions',
    nodes: [
      {
        id: 'trigger-1',
        type: 'trigger',
        position: { x: 100, y: 200 },
        data: {
          label: 'Start',
          type: 'manual',
        },
      },
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 350, y: 200 },
        data: {
          label: 'Check Score',
          expression: 'input.score > 60',
        },
      },
      {
        id: 'ai-pass',
        type: 'ai',
        position: { x: 600, y: 100 },
        data: {
          label: 'Pass Handler',
          provider: 'claude',
          model: 'claude-3-5-sonnet-20241022',
          operation: 'generate',
          prompt: 'Congratulations on passing! Your score: {{input.score}}',
          temperature: 0.7,
        },
      },
      {
        id: 'ai-fail',
        type: 'ai',
        position: { x: 600, y: 300 },
        data: {
          label: 'Fail Handler',
          provider: 'claude',
          model: 'claude-3-5-sonnet-20241022',
          operation: 'generate',
          prompt: 'Unfortunately, you did not pass. Your score: {{input.score}}. Keep trying!',
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
    name: 'Scheduled Webhook',
    description: 'Trigger webhook on schedule',
    nodes: [
      {
        id: 'schedule-1',
        type: 'schedule',
        position: { x: 100, y: 200 },
        data: {
          label: 'Daily Schedule',
          type: 'schedule',
          schedule: '0 9 * * *',
        },
      },
      {
        id: 'http-1',
        type: 'http',
        position: { x: 350, y: 200 },
        data: {
          label: 'Send Notification',
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

// Get template list
export function getTemplateList() {
  return workflowTemplates.map((t, i) => ({
    id: `template-${i}`,
    name: t.name,
    description: t.description,
    nodeCount: t.nodes?.length || 0,
  }));
}

// Get template by ID
export function getTemplateById(id: string) {
  const index = parseInt(id.replace('template-', ''));
  return workflowTemplates[index] || null;
}
