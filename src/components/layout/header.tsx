'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/store/workflow-store';
import { useLocale } from '@/contexts/locale-context';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';

export function Header() {
  const { createWorkflow, workflows, loadWorkflow, currentWorkflow } = useWorkflowStore();
  const { t } = useLocale();

  const handleCreate = () => {
    const name = prompt(t('workflows.createNew') + ':', 'New Workflow');
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
            {t('nav.dashboard')}
          </Button>
          <Button variant="ghost" size="sm" className="text-gray-400">
            {t('nav.templates')}
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
            <option value="">{t('common.select')}</option>
            {workflows.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        )}

        <Button size="sm" onClick={handleCreate}>
          + {t('common.create')}
        </Button>

        <Button variant="default" size="sm">
          Run
        </Button>

        <LocaleSwitcher />
      </div>
    </header>
  );
}
