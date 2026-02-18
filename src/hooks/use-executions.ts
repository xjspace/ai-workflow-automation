'use client';

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import type { WorkflowExecution, NodeExecution } from '@/types/database';

interface UseExecutionsReturn {
  executions: WorkflowExecution[];
  loading: boolean;
  error: string | null;
  loadExecutions: (workflowId?: string) => Promise<void>;
  createExecution: (workflowId: string, input?: Record<string, unknown>) => Promise<string | null>;
  updateExecution: (executionId: string, data: UpdateExecutionInput) => Promise<boolean>;
  recordNodeExecution: (executionId: string, nodeExecution: NodeExecution) => Promise<void>;
  startExecution: (executionId: string) => Promise<void>;
  completeExecution: (executionId: string, output: Record<string, unknown>) => Promise<void>;
  failExecution: (executionId: string, error: string) => Promise<void>;
}

interface UpdateExecutionInput {
  status?: 'pending' | 'running' | 'completed' | 'failed';
  input?: Record<string, unknown>;
  output?: Record<string, unknown>;
  error?: string;
  execution_time_ms?: number;
  node_executions?: NodeExecution[];
  started_at?: string;
  completed_at?: string;
}

export function useExecutions(): UseExecutionsReturn {
  const { user } = useAuth();
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载执行历史
  const loadExecutions = useCallback(async (workflowId?: string) => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('workflow_executions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setExecutions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // 创建执行记录
  const createExecution = useCallback(async (
    workflowId: string,
    input?: Record<string, unknown>
  ): Promise<string | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .insert({
          workflow_id: workflowId,
          user_id: user.id,
          status: 'pending',
          input: input || {},
          output: {},
          node_executions: [],
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建执行记录失败');
      return null;
    }
  }, [user]);

  // 更新执行记录
  const updateExecution = useCallback(async (
    executionId: string,
    data: UpdateExecutionInput
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update(data)
        .eq('id', executionId);

      if (error) throw error;
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新执行记录失败');
      return false;
    }
  }, []);

  // 记录节点执行
  const recordNodeExecution = useCallback(async (
    executionId: string,
    nodeExecution: NodeExecution
  ): Promise<void> => {
    try {
      // 先获取当前的 node_executions
      const { data: current } = await supabase
        .from('workflow_executions')
        .select('node_executions')
        .eq('id', executionId)
        .single();

      const nodeExecutions = (current?.node_executions || []) as NodeExecution[];

      // 更新或添加节点执行记录
      const existingIndex = nodeExecutions.findIndex(ne => ne.nodeId === nodeExecution.nodeId);
      if (existingIndex >= 0) {
        nodeExecutions[existingIndex] = nodeExecution;
      } else {
        nodeExecutions.push(nodeExecution);
      }

      await supabase
        .from('workflow_executions')
        .update({ node_executions: nodeExecutions })
        .eq('id', executionId);
    } catch (err) {
      console.error('记录节点执行失败:', err);
    }
  }, []);

  // 开始执行
  const startExecution = useCallback(async (executionId: string): Promise<void> => {
    await updateExecution(executionId, {
      status: 'running',
      started_at: new Date().toISOString(),
    });
  }, [updateExecution]);

  // 完成执行
  const completeExecution = useCallback(async (
    executionId: string,
    output: Record<string, unknown>
  ): Promise<void> => {
    // 获取开始时间计算执行时长
    const { data } = await supabase
      .from('workflow_executions')
      .select('started_at')
      .eq('id', executionId)
      .single();

    const executionTimeMs = data?.started_at
      ? Date.now() - new Date(data.started_at).getTime()
      : undefined;

    await updateExecution(executionId, {
      status: 'completed',
      output,
      completed_at: new Date().toISOString(),
      ...(executionTimeMs !== undefined && { execution_time_ms: executionTimeMs }),
    });

    // 更新用户使用量
    await incrementUsage();
  }, [updateExecution]);

  // 执行失败
  const failExecution = useCallback(async (
    executionId: string,
    errorMsg: string
  ): Promise<void> => {
    await updateExecution(executionId, {
      status: 'failed',
      error: errorMsg,
      completed_at: new Date().toISOString(),
    });
  }, [updateExecution]);

  // 增加用户使用量
  const incrementUsage = async () => {
    if (!user) return;

    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM

    try {
      // 尝试更新
      const { error: updateError } = await supabase.rpc('increment_usage', {
        p_user_id: user.id,
        p_month: currentMonth,
      });

      // 如果 RPC 不存在，使用 upsert
      if (updateError) {
        await supabase
          .from('user_usage')
          .upsert({
            user_id: user.id,
            month: currentMonth,
            execution_count: 1,
          }, {
            onConflict: 'user_id',
          });
      }
    } catch (err) {
      console.error('更新使用量失败:', err);
    }
  };

  return {
    executions,
    loading,
    error,
    loadExecutions,
    createExecution,
    updateExecution,
    recordNodeExecution,
    startExecution,
    completeExecution,
    failExecution,
  };
}
