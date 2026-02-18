'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { WorkflowEditor } from '@/components/workflow/workflow-editor';
import { useWorkflowStore } from '@/store/workflow-store';
import { useLocale } from '@/contexts/locale-context';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { UsageStats, UserSubscription } from '@/types/subscription';
import { PLANS } from '@/types/subscription';

export default function Home() {
  const { workflows, createWorkflow, loadWorkflow, currentWorkflow } = useWorkflowStore();
  const initializedRef = useRef(false);
  const { t, locale } = useLocale();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [showWelcome, setShowWelcome] = useState(true);

  // 认证检查
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

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

  // 获取订阅和使用量数据
  useEffect(() => {
    if (user) {
      fetch('/api/subscription')
        .then(res => res.json())
        .then(data => {
          setSubscription(data.subscription);
          setUsage(data.usage);
        })
        .catch(console.error);
    }
  }, [user]);

  const currentPlan = subscription?.plan || 'free';
  const planConfig = PLANS[currentPlan];

  if (authLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Header />

      {/* Welcome Banner with Usage Stats */}
      {showWelcome && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <span className="font-medium">
                  {locale === 'en' ? `Welcome, ${user.email?.split('@')[0]}!` : `欢迎，${user.email?.split('@')[0]}！`}
                </span>
                <span className="text-gray-500 ml-2">
                  {locale === 'en' ? `Plan: ${planConfig.name}` : `套餐: ${planConfig.nameZh}`}
                </span>
              </div>

              {/* Quick Usage Stats */}
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">
                    {locale === 'en' ? 'Executions:' : '执行:'}
                  </span>
                  <span className="font-medium">
                    {usage?.execution_count || 0}
                    {planConfig.limits.maxExecutions > 0 && (
                      <span className="text-gray-400">/{planConfig.limits.maxExecutions}</span>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">
                    {locale === 'en' ? 'Workflows:' : '工作流:'}
                  </span>
                  <span className="font-medium">
                    {workflows.length}
                    {planConfig.limits.maxWorkflows > 0 && (
                      <span className="text-gray-400">/{planConfig.limits.maxWorkflows}</span>
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentPlan === 'free' && (
                <Button
                  size="sm"
                  onClick={() => router.push('/pricing')}
                  className="bg-gradient-to-r from-blue-500 to-purple-500"
                >
                  {locale === 'en' ? '⭐ Upgrade to Pro' : '⭐ 升级到专业版'}
                </Button>
              )}
              <button
                onClick={() => setShowWelcome(false)}
                className="text-gray-400 hover:text-gray-600 px-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 overflow-hidden">
        <WorkflowEditor />
      </main>
    </div>
  );
}
