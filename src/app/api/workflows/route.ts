import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase';
import { useWorkflowStore } from '@/store/workflow-store';
import { WorkflowExecutor } from '@/lib/workflow-executor';

// GET /api/workflows - 获取工作流列表
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const { searchParams } = new URL(request.url);
    const useLocal = searchParams.get('local') === 'true';

    // 如果请求本地数据或无认证，返回内存中的工作流
    if (useLocal || !authHeader) {
      const store = useWorkflowStore.getState();
      return NextResponse.json({
        workflows: store.workflows.map((w) => ({
          id: w.id,
          name: w.name,
          description: w.description,
          isActive: w.isActive,
          nodeCount: w.nodes.length,
          edgeCount: w.edges.length,
          createdAt: w.createdAt,
          updatedAt: w.updatedAt,
        })),
        source: 'local',
      });
    }

    // 有认证时，从数据库获取
    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const { data, error } = await supabase
      .from('workflows')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      // 如果表不存在，回退到本地存储
      if (error.code === '42P01') {
        const store = useWorkflowStore.getState();
        return NextResponse.json({
          workflows: store.workflows,
          source: 'local',
        });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workflows: data, source: 'database' });
  } catch (error) {
    console.error('获取工作流失败:', error);
    // 出错时回退到本地存储
    const store = useWorkflowStore.getState();
    return NextResponse.json({
      workflows: store.workflows,
      source: 'local',
    });
  }
}

// POST /api/workflows - 创建或执行工作流
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const authHeader = request.headers.get('authorization');

    // 如果有 execute 标记，执行工作流
    if (body.execute) {
      const { workflowId, input } = body;

      if (!workflowId) {
        return NextResponse.json(
          { error: 'workflowId is required' },
          { status: 400 }
        );
      }

      // 从 store 获取工作流定义
      const store = useWorkflowStore.getState();
      const workflow = store.workflows.find((w) => w.id === workflowId);

      if (!workflow) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }

      // 创建执行器并执行
      const executor = new WorkflowExecutor({
        claude: process.env.ANTHROPIC_API_KEY || '',
        openai: process.env.OPENAI_API_KEY || '',
        deepseek: process.env.DEEPSEEK_API_KEY || '',
        zhipu: process.env.ZHIPU_API_KEY || '',
      });

      const result = await executor.execute(
        workflow.nodes,
        workflow.edges,
        input
      );

      return NextResponse.json(result);
    }

    // 否则创建新工作流
    if (!authHeader) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const supabase = createServerClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: '未授权' }, { status: 401 });
    }

    const { name, description, nodes, edges, variables } = body;

    if (!name || !nodes || !edges) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('workflows')
      .insert({
        user_id: user.id,
        name,
        description: description || null,
        nodes,
        edges,
        variables: variables || {},
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ workflow: data }, { status: 201 });
  } catch (error) {
    console.error('Workflow operation error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
