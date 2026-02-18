'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/store/workflow-store';

export function Header() {
  const { createWorkflow, workflows, loadWorkflow, currentWorkflow } = useWorkflowStore();

  const handleCreate = () => {
    const name = prompt('输入工作流名称:', '新建工作流');
    if (name) {
      createWorkflow(name);
    }
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="font-bold text-lg text-gray-800">AI Workflow</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className={currentWorkflow ? 'text-gray-600' : 'text-gray-400'}
          >
            编辑器
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400">
            模板
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400">
            文档
          </Button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {workflows.length > 0 && (
          <select
            value={currentWorkflow?.id || ''}
            onChange={(e) => loadWorkflow(e.target.value)}
            className="h-8 px-2 text-sm border border-gray-200 rounded-md bg-white"
          >
            <option value="">选择工作流</option>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        )}

        <Button size="sm" onClick={handleCreate}>
          + 新建
        </Button>

        <Button variant="default" size="sm">
          运行
        </Button>
      </div>
    </header>
  );
}
