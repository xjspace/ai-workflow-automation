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

  // Load execution history
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
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Create execution record
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
      setError(err instanceof Error ? err.message : 'Failed to create execution record');
      return null;
    }
  }, [user]);

  // Update execution record
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
      setError(err instanceof Error ? err.message : 'Failed to update execution record');
      return false;
    }
  }, []);

  // Record node execution
  const recordNodeExecution = useCallback(async (
    executionId: string,
    nodeExecution: NodeExecution
  ): Promise<void> => {
    try {
      // Get current node_executions first
      const { data: current } = await supabase
        .from('workflow_executions')
        .select('node_executions')
        .eq('id', executionId)
        .single();

      const nodeExecutions = (current?.node_executions || []) as NodeExecution[];

      // Update or add node execution record
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
      console.error('Failed to record node execution:', err);
    }
  }, []);

  // Start execution
  const startExecution = useCallback(async (executionId: string): Promise<void> => {
    await updateExecution(executionId, {
      status: 'running',
      started_at: new Date().toISOString(),
    });
  }, [updateExecution]);

  // Complete execution
  const completeExecution = useCallback(async (
    executionId: string,
    output: Record<string, unknown>
  ): Promise<void> => {
    // Get start time to calculate execution duration
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

    // Update user usage
    if (user) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      try {
        const { error: updateError } = await supabase.rpc('increment_usage', {
          p_user_id: user.id,
          p_month: currentMonth,
        });

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
        console.error('Failed to update usage:', err);
      }
    }
  }, [updateExecution, user]);

  // Execution failed
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
