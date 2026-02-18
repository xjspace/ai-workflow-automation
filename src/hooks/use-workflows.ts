'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './use-auth';
import type { Workflow, WorkflowNode, WorkflowEdge } from '@/types/database';

interface UseWorkflowsReturn {
  workflows: Workflow[];
  loading: boolean;
  error: string | null;
  createWorkflow: (data: CreateWorkflowInput) => Promise<Workflow | null>;
  updateWorkflow: (id: string, data: UpdateWorkflowInput) => Promise<boolean>;
  deleteWorkflow: (id: string) => Promise<boolean>;
  getWorkflow: (id: string) => Promise<Workflow | null>;
  saveCurrentWorkflow: (data: SaveWorkflowInput) => Promise<Workflow | null>;
}

interface CreateWorkflowInput {
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, unknown>;
}

interface UpdateWorkflowInput {
  name?: string;
  description?: string;
  nodes?: WorkflowNode[];
  edges?: WorkflowEdge[];
  variables?: Record<string, unknown>;
  is_active?: boolean;
}

interface SaveWorkflowInput {
  id?: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables?: Record<string, unknown>;
}

export function useWorkflows(): UseWorkflowsReturn {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载用户的工作流列表
  const loadWorkflows = useCallback(async () => {
    if (!user) {
      setWorkflows([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  // 创建工作流
  const createWorkflow = useCallback(async (input: CreateWorkflowInput): Promise<Workflow | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          nodes: input.nodes,
          edges: input.edges,
          variables: input.variables || {},
        })
        .select()
        .single();

      if (error) throw error;

      setWorkflows(prev => [data, ...prev]);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建失败');
      return null;
    }
  }, [user]);

  // 更新工作流
  const updateWorkflow = useCallback(async (id: string, input: UpdateWorkflowInput): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('workflows')
        .update(input)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setWorkflows(prev =>
        prev.map(w => (w.id === id ? { ...w, ...input, updated_at: new Date().toISOString() } : w))
      );
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新失败');
      return false;
    }
  }, [user]);

  // 删除工作流
  const deleteWorkflow = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('workflows')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setWorkflows(prev => prev.filter(w => w.id !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除失败');
      return false;
    }
  }, [user]);

  // 获取单个工作流
  const getWorkflow = useCallback(async (id: string): Promise<Workflow | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取失败');
      return null;
    }
  }, [user]);

  // 保存工作流（创建或更新）
  const saveCurrentWorkflow = useCallback(async (input: SaveWorkflowInput): Promise<Workflow | null> => {
    if (input.id) {
      const success = await updateWorkflow(input.id, {
        name: input.name,
        description: input.description,
        nodes: input.nodes,
        edges: input.edges,
        variables: input.variables,
      });
      if (success) {
        return workflows.find(w => w.id === input.id) || null;
      }
      return null;
    } else {
      return createWorkflow(input);
    }
  }, [createWorkflow, updateWorkflow, workflows]);

  return {
    workflows,
    loading,
    error,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow,
    getWorkflow,
    saveCurrentWorkflow,
  };
}
