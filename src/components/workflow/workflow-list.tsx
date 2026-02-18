'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/contexts/locale-context';
import { supabase } from '@/lib/supabase';
import type { Workflow } from '@/types/database';

export function WorkflowList({ onSelect, onCreateNew }: { onSelect: (workflow: Workflow) => void; onCreateNew: () => void }) {
  const { user } = useAuth();
  const { t, formatRelativeTime } = useLocale();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkflows = async () => {
      setLoading(true);
      try {
        if (user) {
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
        console.error('Failed to load workflows:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkflows();
  }, [user]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(t('workflows.confirmDelete'))) return;

    try {
      if (user) {
        await supabase.from('workflows').delete().eq('id', id);
      }
      setWorkflows(prev => prev.filter(w => w.id !== id));
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">{t('common.loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{t('workflows.title')}</h2>
          <p className="text-gray-500">{t('workflows.subtitle')}</p>
        </div>
        <Button onClick={onCreateNew}>{t('workflows.createNew')}</Button>
      </div>

      {workflows.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">{t('workflows.empty')}</p>
            <Button onClick={onCreateNew}>{t('workflows.createFirst')}</Button>
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
                    {workflow.is_active ? t('workflows.enabled') : t('workflows.disabled')}
                  </Badge>
                </div>
                <CardDescription className="line-clamp-2">
                  {workflow.description || t('workflows.noDescription')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>
                    {workflow.nodes.length} {t('workflows.nodes')} · {workflow.edges.length} {t('workflows.edges')}
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
                    {t('common.edit')}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={(e) => handleDelete(workflow.id, e)}
                  >
                    {t('common.delete')}
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
