/**
 * 工作流执行引擎
 * 负责执行工作流中的各个节点
 */

import type { WorkflowNode, WorkflowEdge, AINodeData, HTTPNodeData, ConditionNodeData, TransformNodeData } from '@/types/workflow';

// 执行上下文
export interface ExecutionContext {
  workflowId: string;
  executionId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  variables: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeOutputs: Record<string, any>;
  startTime: Date;
}

// 执行结果
export interface ExecutionResult {
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output?: any;
  error?: string;
  duration: number;
  nodeResults: Record<string, NodeResult>;
}

// 节点执行结果
export interface NodeResult {
  nodeId: string;
  success: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  output?: any;
  error?: string;
  duration: number;
}

// 执行引擎类
export class WorkflowExecutor {
  private apiKeys: Record<string, string>;

  constructor(apiKeys?: Record<string, string>) {
    this.apiKeys = apiKeys || {};
  }

  /**
   * 执行整个工作流
   */
  async execute(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input?: any
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const context: ExecutionContext = {
      workflowId: '',
      executionId: `exec-${Date.now()}`,
      variables: { input },
      nodeOutputs: {},
      startTime: new Date(),
    };

    const nodeResults: Record<string, NodeResult> = {};

    try {
      // 找到触发器节点作为起点
      const triggerNode = nodes.find(
        (n) => n.type === 'trigger' || n.type === 'webhook' || n.type === 'schedule'
      );

      if (!triggerNode) {
        throw new Error('No trigger node found');
      }

      // 按拓扑顺序执行节点
      const executionOrder = this.getExecutionOrder(nodes, edges, triggerNode.id);

      for (const nodeId of executionOrder) {
        const node = nodes.find((n) => n.id === nodeId);
        if (!node) continue;

        const nodeStartTime = Date.now();
        try {
          const output = await this.executeNode(node, context);
          context.nodeOutputs[nodeId] = output;
          nodeResults[nodeId] = {
            nodeId,
            success: true,
            output,
            duration: Date.now() - nodeStartTime,
          };
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          nodeResults[nodeId] = {
            nodeId,
            success: false,
            error: errorMessage,
            duration: Date.now() - nodeStartTime,
          };
          throw error;
        }
      }

      // 获取最后一个节点的输出作为工作流输出
      const lastNodeId = executionOrder[executionOrder.length - 1];
      const finalOutput = context.nodeOutputs[lastNodeId];

      return {
        success: true,
        output: finalOutput,
        duration: Date.now() - startTime,
        nodeResults,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        error: errorMessage,
        duration: Date.now() - startTime,
        nodeResults,
      };
    }
  }

  /**
   * 执行单个节点
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async executeNode(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    switch (node.type) {
      case 'trigger':
      case 'webhook':
      case 'schedule':
        return this.executeTrigger(node, context);

      case 'ai':
        return this.executeAI(node, context);

      case 'http':
        return this.executeHTTP(node, context);

      case 'condition':
        return this.executeCondition(node, context);

      case 'transform':
        return this.executeTransform(node, context);

      case 'loop':
        return this.executeLoop(node, context);

      default:
        throw new Error(`Unknown node type: ${node.type}`);
    }
  }

  /**
   * 执行触发器节点
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async executeTrigger(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    // 触发器节点返回输入数据
    return context.variables.input || {};
  }

  /**
   * 执行 AI 节点
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async executeAI(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const data = node.data as AINodeData;

    // 替换提示词中的变量
    const prompt = this.interpolateString(data.prompt, context);

    // 根据提供商调用不同的 AI API
    switch (data.provider) {
      case 'claude':
        return this.callClaudeAPI(prompt, data);

      case 'openai':
        return this.callOpenAIAPI(prompt, data);

      case 'deepseek':
        return this.callDeepSeekAPI(prompt, data);

      case 'zhipu':
        return this.callZhipuAPI(prompt, data);

      default:
        throw new Error(`Unknown AI provider: ${data.provider}`);
    }
  }

  /**
   * 执行 HTTP 节点
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async executeHTTP(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const data = node.data as HTTPNodeData;

    // 替换 URL 中的变量
    const url = this.interpolateString(data.url, context);

    // 准备请求选项
    const options: RequestInit = {
      method: data.method,
      headers: {
        'Content-Type': 'application/json',
        ...data.headers,
      },
    };

    if (data.body && ['POST', 'PUT', 'PATCH'].includes(data.method)) {
      options.body = JSON.stringify(
        this.interpolateObject(JSON.parse(data.body), context)
      );
    }

    // 发送请求
    const response = await fetch(url, options);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * 执行条件节点
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async executeCondition(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const data = node.data as ConditionNodeData;

    // 评估表达式
    const result = this.evaluateExpression(data.expression, context);

    return { condition: !!result };
  }

  /**
   * 执行转换节点
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async executeTransform(node: WorkflowNode, context: ExecutionContext): Promise<any> {
    const data = node.data as TransformNodeData;

    // 执行转换表达式
    return this.evaluateExpression(data.expression, context);
  }

  /**
   * 执行循环节点
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async executeLoop(_node: WorkflowNode, _context: ExecutionContext): Promise<any> {
    // 循环节点需要特殊处理，这里简化实现
    return { loop: true };
  }

  /**
   * 获取节点执行顺序 (拓扑排序)
   */
  private getExecutionOrder(
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    startNodeId: string
  ): string[] {
    const visited = new Set<string>();
    const order: string[] = [];

    const visit = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      order.push(nodeId);

      // 找到所有以此节点为源的边
      const outgoingEdges = edges.filter((e) => e.source === nodeId);
      for (const edge of outgoingEdges) {
        visit(edge.target);
      }
    };

    visit(startNodeId);
    return order;
  }

  /**
   * 字符串插值
   */
  private interpolateString(template: string, context: ExecutionContext): string {
    return template.replace(/\{\{([^}]+)\}\}/g, (_, path) => {
      const value = this.getValueByPath(context, path.trim());
      return value !== undefined ? String(value) : '';
    });
  }

  /**
   * 对象插值
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private interpolateObject(obj: any, context: ExecutionContext): any {
    if (typeof obj === 'string') {
      return this.interpolateString(obj, context);
    }
    if (Array.isArray(obj)) {
      return obj.map((item) => this.interpolateObject(item, context));
    }
    if (typeof obj === 'object' && obj !== null) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = {};
      for (const [key, value] of Object.entries(obj)) {
        result[key] = this.interpolateObject(value, context);
      }
      return result;
    }
    return obj;
  }

  /**
   * 根据路径获取值
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private getValueByPath(obj: any, path: string): any {
    const parts = path.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let current: any = obj;

    for (const part of parts) {
      if (current === null || current === undefined) return undefined;

      // 处理数组索引
      const arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        const [, key, index] = arrayMatch;
        current = current[key]?.[parseInt(index)];
      } else {
        current = current[part];
      }
    }

    return current;
  }

  /**
   * 评估表达式
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private evaluateExpression(expression: string, context: ExecutionContext): any {
    // 安全的表达式评估 (使用 Function 构造器)
    try {
      const func = new Function(
        'context',
        `with(context) { return ${expression}; }`
      );
      return func(context);
    } catch {
      // 如果评估失败，尝试作为简单路径
      return this.getValueByPath(context, expression);
    }
  }

  // AI API 调用方法

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async callClaudeAPI(prompt: string, data: AINodeData): Promise<any> {
    const apiKey = this.apiKeys.claude || process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
      throw new Error('Claude API key not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: data.model || 'claude-3-5-sonnet-20241022',
        max_tokens: data.maxTokens || 1024,
        temperature: data.temperature ?? 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${error}`);
    }

    const result = await response.json();
    return {
      text: result.content[0]?.text || '',
      usage: result.usage,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async callOpenAIAPI(prompt: string, data: AINodeData): Promise<any> {
    const apiKey = this.apiKeys.openai || process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: data.model || 'gpt-4o',
        max_tokens: data.maxTokens || 1024,
        temperature: data.temperature ?? 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${error}`);
    }

    const result = await response.json();
    return {
      text: result.choices[0]?.message?.content || '',
      usage: result.usage,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async callDeepSeekAPI(prompt: string, data: AINodeData): Promise<any> {
    const apiKey = this.apiKeys.deepseek || process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('DeepSeek API key not configured');
    }

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: data.model || 'deepseek-chat',
        max_tokens: data.maxTokens || 1024,
        temperature: data.temperature ?? 0.7,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${error}`);
    }

    const result = await response.json();
    return {
      text: result.choices[0]?.message?.content || '',
      usage: result.usage,
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async callZhipuAPI(prompt: string, data: AINodeData): Promise<any> {
    const apiKey = this.apiKeys.zhipu || process.env.ZHIPU_API_KEY;

    if (!apiKey) {
      throw new Error('Zhipu API key not configured');
    }

    const response = await fetch(
      'https://open.bigmodel.cn/api/paas/v4/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: data.model || 'glm-4',
          max_tokens: data.maxTokens || 1024,
          temperature: data.temperature ?? 0.7,
          messages: [{ role: 'user', content: prompt }],
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Zhipu API error: ${error}`);
    }

    const result = await response.json();
    return {
      text: result.choices[0]?.message?.content || '',
      usage: result.usage,
    };
  }
}

// 导出单例
export const workflowExecutor = new WorkflowExecutor();
