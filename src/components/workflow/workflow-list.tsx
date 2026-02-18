'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import type { Workflow } from '@/types/database';

// 简单的相对时间格式化
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return '刚刚';
  if (diffMins < 60) return `${diffMins} 分钟前`;
  if (diffHours < 24) return `${diffHours} 小时前`;
  if (diffDays < 7) return `${diffDays} 天前`;
  return date.toLocaleDateString('zh-CN');
}

interface WorkflowListProps {
  onSelect: (workflow: Workflow) => void;
  onCreateNew: () => void;
}

export function WorkflowList({ onSelect, onCreateNew }: WorkflowListProps) {
  const { user } = useAuth();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkflows = async () => {
      setLoading(true);
      try {
        if (user) {
          // 已登录用户从数据库加载
          const { data, error } = await supabase
            .from('workflows')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

          if (!error && data) {
            setWorkflows(data);
          }
        }
      } catch (error) {
        console.error('加载工作流失败:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('确定要删除这个工作流吗？')) return;

    try {
      if (user) {
        await supabase.from('workflows').delete().eq('id', id);
      }
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">我的工作流</h2>
          <p className="text-gray-500">管理和编辑你的工作流</p>
        </div>
        <Button onClick={onCreateNew}>创建新工作流</Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">还没有保存的工作流</p>
            <Button onClick={onCreateNew}>创建第一个工作流</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <Card
              key={workflow.id}
              className="cursor-pointer hover:border-indigo-500 transition-colors"
              onClick={() => onSelect(workflow)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{workflow.name}</CardTitle>
                  <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                    {workflow.is_active ? '启用' : '禁用'}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {workflow.description || '暂无描述'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {workflow.nodes.length} 个节点 · {workflow.edges.length} 条连线
                  </span>
                  <span>
                    {formatRelativeTime(workflow.updated_at)}
                  </span>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => onSelect(workflow)}
                  >
                    编辑
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={(e) => handleDelete(workflow.id, e)}
                  >
                    删除
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
