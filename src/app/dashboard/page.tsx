'use client';

import { useEffect, useRef } from 'react';
import { Header } from '@/components/layout/header';
import { WorkflowEditor } from '@/components/workflow/workflow-editor';
import { useWorkflowStore } from '@/store/workflow-store';

export default function Home() {
  const { workflows, createWorkflow, loadWorkflow, currentWorkflow } = useWorkflowStore();
  const initializedRef = useRef(false);

  // 初始化逻辑 - 只在客户端执行一次
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // 如果没有工作流，创建一个示例
    if (workflows.length === 0) {
      createWorkflow('示例工作流', '这是一个示例 AI 工作流');
    }
  }, [workflows.length, createWorkflow]);

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
