import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseApiClient } from '@/lib/supabase';

// GET /api/templates - 获取模板列表
export async function GET(request: NextRequest) {
  try {
    const supabase = createSupabaseApiClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20');

    let query = supabase
      .from('workflow_templates')
      .select('*')
      .eq('is_public', true)
      .order('use_count', { ascending: false })
      .limit(limit);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      // 如果表不存在，返回预置模板
      if (error.code === '42P01') {
        return NextResponse.json({
          templates: getBuiltinTemplates()
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 如果没有数据，返回预置模板
    if (!data || data.length === 0) {
      return NextResponse.json({
        templates: getBuiltinTemplates()
      });
    }

    return NextResponse.json({ templates: data });
  } catch (error) {
    console.error('获取模板失败:', error);
    return NextResponse.json({
      templates: getBuiltinTemplates()
    });
  }
}

// 预置模板（当数据库无数据时使用）
function getBuiltinTemplates() {
  return [
    {
      id: 'builtin-1',
      name: 'AI 文本生成',
      description: '使用 AI 生成文本内容，适合内容创作、文案生成等场景',
      category: 'AI',
      nodes: [
        { id: 'input-1', type: 'input', position: { x: 100, y: 100 }, data: { label: '输入提示词' } },
        { id: 'ai-1', type: 'ai', position: { x: 350, y: 100 }, data: { label: 'AI 生成', model: 'claude', prompt: '' } },
        { id: 'output-1', type: 'output', position: { x: 600, y: 100 }, data: { label: '输出结果' } }
      ],
      edges: [
        { id: 'e1', source: 'input-1', target: 'ai-1' },
        { id: 'e2', source: 'ai-1', target: 'output-1' }
      ],
      variables: {},
      use_count: 100
    },
    {
      id: 'builtin-2',
      name: 'HTTP 数据获取',
      description: '从 API 获取数据并进行处理，适合数据集成场景',
      category: '数据',
      nodes: [
        { id: 'trigger-1', type: 'trigger', position: { x: 100, y: 100 }, data: { label: '触发器' } },
        { id: 'http-1', type: 'http', position: { x: 300, y: 100 }, data: { label: 'HTTP 请求', method: 'GET', url: '' } },
        { id: 'transform-1', type: 'transform', position: { x: 500, y: 100 }, data: { label: '数据转换' } },
        { id: 'output-2', type: 'output', position: { x: 700, y: 100 }, data: { label: '输出结果' } }
      ],
      edges: [
        { id: 'e1', source: 'trigger-1', target: 'http-1' },
        { id: 'e2', source: 'http-1', target: 'transform-1' },
        { id: 'e3', source: 'transform-1', target: 'output-2' }
      ],
      variables: {},
      use_count: 80
    },
    {
      id: 'builtin-3',
      name: '内容分析流程',
      description: '分析文本内容并生成报告，适合内容审核、舆情分析等',
      category: 'AI',
      nodes: [
        { id: 'input-2', type: 'input', position: { x: 100, y: 150 }, data: { label: '输入文本' } },
        { id: 'ai-2', type: 'ai', position: { x: 300, y: 80 }, data: { label: '情感分析', model: 'claude' } },
        { id: 'ai-3', type: 'ai', position: { x: 300, y: 220 }, data: { label: '关键词提取', model: 'claude' } },
        { id: 'merge-1', type: 'transform', position: { x: 500, y: 150 }, data: { label: '合并结果' } },
        { id: 'output-3', type: 'output', position: { x: 700, y: 150 }, data: { label: '分析报告' } }
      ],
      edges: [
        { id: 'e1', source: 'input-2', target: 'ai-2' },
        { id: 'e2', source: 'input-2', target: 'ai-3' },
        { id: 'e3', source: 'ai-2', target: 'merge-1' },
        { id: 'e4', source: 'ai-3', target: 'merge-1' },
        { id: 'e5', source: 'merge-1', target: 'output-3' }
      ],
      variables: {},
      use_count: 60
    },
    {
      id: 'builtin-4',
      name: '条件分支流程',
      description: '根据条件执行不同的分支，适合业务流程自动化',
      category: '逻辑',
      nodes: [
        { id: 'input-3', type: 'input', position: { x: 100, y: 150 }, data: { label: '输入数据' } },
        { id: 'condition-1', type: 'condition', position: { x: 300, y: 150 }, data: { label: '条件判断' } },
        { id: 'ai-4', type: 'ai', position: { x: 500, y: 80 }, data: { label: '分支 A' } },
        { id: 'ai-5', type: 'ai', position: { x: 500, y: 220 }, data: { label: '分支 B' } },
        { id: 'output-4', type: 'output', position: { x: 700, y: 150 }, data: { label: '输出结果' } }
      ],
      edges: [
        { id: 'e1', source: 'input-3', target: 'condition-1' },
        { id: 'e2', source: 'condition-1', target: 'ai-4', sourceHandle: 'true' },
        { id: 'e3', source: 'condition-1', target: 'ai-5', sourceHandle: 'false' },
        { id: 'e4', source: 'ai-4', target: 'output-4' },
        { id: 'e5', source: 'ai-5', target: 'output-4' }
      ],
      variables: {},
      use_count: 45
    },
    {
      id: 'builtin-5',
      name: '定时 Webhook',
      description: '定时触发并调用 Webhook，适合定时任务和通知场景',
      category: '自动化',
      nodes: [
        { id: 'trigger-2', type: 'trigger', position: { x: 100, y: 100 }, data: { label: '定时触发', triggerType: 'schedule' } },
        { id: 'http-2', type: 'http', position: { x: 300, y: 100 }, data: { label: 'Webhook', method: 'POST' } },
        { id: 'output-5', type: 'output', position: { x: 500, y: 100 }, data: { label: '执行结果' } }
      ],
      edges: [
        { id: 'e1', source: 'trigger-2', target: 'http-2' },
        { id: 'e2', source: 'http-2', target: 'output-5' }
      ],
      variables: {},
      use_count: 30
    }
  ];
}
