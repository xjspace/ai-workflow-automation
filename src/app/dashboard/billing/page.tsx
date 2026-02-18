'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/contexts/locale-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/layout/header';
import { PLANS, type SubscriptionPlan, type UserSubscription, type UsageStats, type Order } from '@/types/subscription';

export default function BillingPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { locale } = useLocale();
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push('/auth/login');
      return;
    }

    fetchBillingData();
  }, [user, authLoading, router]);

  const fetchBillingData = async () => {
    try {
      const response = await fetch('/api/subscription');
      const data = await response.json();

      setSubscription(data.subscription);
      setUsage(data.usage);
      setOrders(data.recentOrders || []);
    } catch (error) {
      console.error('获取计费数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleCancel = async () => {
    if (!confirm(locale === 'en' ? 'Are you sure you want to cancel?' : '确定要取消吗？')) {
      return;
    }

    try {
      const response = await fetch('/api/subscription', { method: 'DELETE' });
      const data = await response.json();

      if (data.success) {
        fetchBillingData();
      }
    } catch (error) {
      console.error('取消订阅失败:', error);
    }
  };

  const currentPlan = subscription?.plan || 'free';
  const planConfig = PLANS[currentPlan];

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(locale === 'en' ? 'en-US' : 'zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin text-4xl">⏳</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 py-8 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Page Title */}
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">
              {locale === 'en' ? 'Billing & Subscription' : '计费与订阅'}
            </h1>
            <Button variant="outline" onClick={() => router.push('/dashboard')}>
              {locale === 'en' ? '← Back to Dashboard' : '← 返回仪表盘'}
            </Button>
          </div>

          {/* Current Plan Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📦</span>
                {locale === 'en' ? 'Current Plan' : '当前套餐'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {locale === 'en' ? planConfig.name : planConfig.nameZh}
                  </div>
                  <div className="text-gray-500 mt-1">
                    {subscription ? (
                      <>
                        {locale === 'en' ? 'Renews on' : '续期于'} {formatDate(subscription.current_period_end)}
                      </>
                    ) : (
                      locale === 'en' ? 'Free forever' : '永久免费'
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  {currentPlan === 'free' ? (
                    <Button onClick={handleUpgrade}>
                      {locale === 'en' ? 'Upgrade Plan' : '升级套餐'}
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleUpgrade}>
                        {locale === 'en' ? 'Change Plan' : '更换套餐'}
                      </Button>
                      {subscription && !subscription.cancel_at_period_end && (
                        <Button variant="destructive" onClick={handleCancel}>
                          {locale === 'en' ? 'Cancel' : '取消'}
                        </Button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">📊</span>
                {locale === 'en' ? 'Usage This Month' : '本月使用量'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* Workflows */}
                <div>
                  <div className="text-sm text-gray-500">
                    {locale === 'en' ? 'Workflows' : '工作流'}
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {usage?.workflow_count || 0}
                    {planConfig.limits.maxWorkflows > 0 && (
                      <span className="text-gray-400 text-lg">
                        /{planConfig.limits.maxWorkflows}
                      </span>
                    )}
                  </div>
                  {planConfig.limits.maxWorkflows > 0 && (
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((usage?.workflow_count || 0) / planConfig.limits.maxWorkflows) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Executions */}
                <div>
                  <div className="text-sm text-gray-500">
                    {locale === 'en' ? 'Executions' : '执行次数'}
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {usage?.execution_count || 0}
                    {planConfig.limits.maxExecutions > 0 && (
                      <span className="text-gray-400 text-lg">
                        /{planConfig.limits.maxExecutions}
                      </span>
                    )}
                  </div>
                  {planConfig.limits.maxExecutions > 0 && (
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          ((usage?.execution_count || 0) / planConfig.limits.maxExecutions) > 0.8
                            ? 'bg-orange-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            ((usage?.execution_count || 0) / planConfig.limits.maxExecutions) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* AI Credits */}
                <div>
                  <div className="text-sm text-gray-500">
                    {locale === 'en' ? 'AI Credits' : 'AI 额度'}
                  </div>
                  <div className="text-2xl font-bold mt-1">
                    {usage?.ai_credits_used || 0}
                    {planConfig.limits.aiCredits > 0 && (
                      <span className="text-gray-400 text-lg">
                        /{planConfig.limits.aiCredits}
                      </span>
                    )}
                  </div>
                  {planConfig.limits.aiCredits > 0 && (
                    <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.min(
                            ((usage?.ai_credits_used || 0) / planConfig.limits.aiCredits) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order History */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">🧾</span>
                {locale === 'en' ? 'Order History' : '订单历史'}
              </CardTitle>
              <CardDescription>
                {locale === 'en'
                  ? 'Your recent payments and invoices'
                  : '您的最近付款和发票'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {locale === 'en' ? 'No orders yet' : '暂无订单'}
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between py-3 border-b last:border-0"
                    >
                      <div>
                        <div className="font-medium">
                          {locale === 'en' ? PLANS[order.plan].name : PLANS[order.plan].nameZh}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(order.created_at)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatCurrency(order.amount, order.currency)}
                        </div>
                        <div
                          className={`text-sm ${
                            order.status === 'paid'
                              ? 'text-green-600'
                              : order.status === 'failed'
                              ? 'text-red-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {order.status === 'paid'
                            ? locale === 'en'
                              ? 'Paid'
                              : '已支付'
                            : order.status === 'failed'
                            ? locale === 'en'
                              ? 'Failed'
                              : '失败'
                            : order.status}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">💳</span>
                {locale === 'en' ? 'Payment Method' : '支付方式'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {subscription ? (
                <div className="flex items-center justify-between">
                  <div className="text-gray-600">
                    {locale === 'en'
                      ? `Managed via ${subscription.payment_provider}`
                      : `通过 ${subscription.payment_provider} 管理`}
                  </div>
                  <Button variant="outline" size="sm">
                    {locale === 'en' ? 'Manage' : '管理'}
                  </Button>
                </div>
              ) : (
                <div className="text-gray-500">
                  {locale === 'en'
                    ? 'No payment method on file'
                    : '暂无支付方式'}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
