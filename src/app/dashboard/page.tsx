'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/layout/header';
import { WorkflowEditor } from '@/components/workflow/workflow-editor';
import { useWorkflowStore } from '@/store/workflow-store';

export default function Home() {
  const { workflows, createWorkflow, loadWorkflow, currentWorkflow } = useWorkflowStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 如果没有工作流，创建一个示例
  useEffect(() => {
    if (mounted && workflows.length === 0) {
      createWorkflow('示例工作流', '这是一个示例 AI 工作流');
    }
  }, [mounted, workflows.length, createWorkflow]);

  // 自动加载第一个工作流
  useEffect(() => {
    if (mounted && workflows.length > 0 && !currentWorkflow) {
      loadWorkflow(workflows[0].id);
    }
  }, [mounted, workflows, currentWorkflow, loadWorkflow]);

  if (!mounted) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <WorkflowEditor />
      </main>
    </div>
  );
}
