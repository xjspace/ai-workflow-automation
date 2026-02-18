'use client';

import { useEffect, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { WorkflowEditor } from '@/components/workflow/workflow-editor';
import { useWorkflowStore } from '@/store/workflow-store';
import { useLocale } from '@/contexts/locale-context';

export default function Home() {
  const { workflows, createWorkflow, loadWorkflow, currentWorkflow } = useWorkflowStore();
  const initializedRef = useRef(false);
  const { t } = useLocale();

  // 初始化逻辑 - 只在客户端执行一次
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 如果没有工作流，创建一个示例
    if (workflows.length === 0) {
      createWorkflow(t('dashboard.exampleWorkflow'), t('dashboard.exampleWorkflowDesc'));
    }
  }, [workflows.length, createWorkflow, t]);

  // 自动加载第一个工作流
  useEffect(() => {
    if (workflows.length > 0 && !currentWorkflow) {
      loadWorkflow(workflows[0].id);
    }
  }, [workflows, currentWorkflow, loadWorkflow]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <WorkflowEditor />
      </main>
    </div>
  );
}
