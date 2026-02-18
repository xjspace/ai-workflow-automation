'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useWorkflowStore } from '@/store/workflow-store';
import { useLocale } from '@/contexts/locale-context';
import { useAuth } from '@/hooks/use-auth';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';

export function Header() {
  const { createWorkflow, workflows, loadWorkflow, currentWorkflow } = useWorkflowStore();
  const { t, locale } = useLocale();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleCreate = () => {
    const name = prompt(t('workflows.createNew') + ':', 'New Workflow');
    if (name) {
      createWorkflow(name);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  return (
    <header className="h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          <span className="font-bold text-lg text-gray-800">AI Workflow</span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          <Link href="/dashboard">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-600"
            >
              {t('nav.dashboard')}
            </Button>
          </Link>
          <Link href="/dashboard/billing">
            <Button variant="ghost" size="sm" className="text-gray-600">
              {locale === 'en' ? 'Billing' : '计费'}
            </Button>
          </Link>
          <Link href="/pricing">
            <Button variant="ghost" size="sm" className="text-gray-400">
              {t('nav.templates')}
            </Button>
          </Link>
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

        {/* User Menu */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-medium"
            >
              {user.email?.[0].toUpperCase() || 'U'}
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                <div className="px-4 py-2 border-b">
                  <div className="text-sm font-medium truncate">{user.email}</div>
                  <div className="text-xs text-gray-500">
                    {locale === 'en' ? 'Free Plan' : '免费版'}
                  </div>
                </div>
                <Link
                  href="/dashboard/billing"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowUserMenu(false)}
                >
                  {locale === 'en' ? '⚙️ Billing & Plans' : '⚙️ 计费与套餐'}
                </Link>
                <button
                  onClick={handleSignOut}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  {locale === 'en' ? '🚪 Sign Out' : '🚪 退出登录'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
