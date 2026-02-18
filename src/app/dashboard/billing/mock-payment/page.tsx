'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/locale-context';
import type { SubscriptionPlan } from '@/types/subscription';

function MockPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { t, locale } = useLocale();
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);

  const paymentId = searchParams.get('payment_id');
  const plan = searchParams.get('plan') as SubscriptionPlan;
  const userId = searchParams.get('user_id');
  const billingCycle = searchParams.get('billing_cycle');

  useEffect(() => {
    if (!paymentId || !plan || !userId) {
      setProcessing(false);
      return;
    }

    // 模拟支付处理
    const processPayment = async () => {
      try {
        // 调用 webhook 处理
        const response = await fetch('/api/billing/webhook', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-payment-provider': 'mock',
          },
          body: JSON.stringify({
            event_name: 'payment_completed',
            data: {
              userId,
              plan,
              paymentId,
              billingCycle,
            },
          }),
        });

        const result = await response.json();
        setSuccess(result.received);
      } catch (error) {
        console.error('支付处理失败:', error);
        setSuccess(false);
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, [paymentId, plan, userId, billingCycle]);

  if (processing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="animate-spin text-4xl mb-4">⏳</div>
            <CardTitle>
              {locale === 'en' ? 'Processing Payment...' : '正在处理支付...'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">✅</div>
            <CardTitle>
              {locale === 'en' ? 'Payment Successful!' : '支付成功！'}
            </CardTitle>
            <CardDescription>
              {locale === 'en'
                ? `Your ${plan} plan is now active.`
                : `您的 ${plan} 套餐已激活。`}
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              {locale === 'en' ? 'Go to Dashboard' : '返回仪表盘'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-4xl mb-4">❌</div>
          <CardTitle>
            {locale === 'en' ? 'Payment Failed' : '支付失败'}
          </CardTitle>
          <CardDescription>
            {locale === 'en'
              ? 'Something went wrong. Please try again.'
              : '出现问题，请重试。'}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <Button onClick={() => router.push('/pricing')} variant="outline" className="w-full">
            {locale === 'en' ? 'Back to Pricing' : '返回定价页面'}
          </Button>
          <Button onClick={() => router.push('/dashboard')} className="w-full">
            {locale === 'en' ? 'Go to Dashboard' : '返回仪表盘'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function LoadingFallback() {
  const { locale } = useLocale();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="animate-pulse">
            <div className="h-8 w-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
            <div className="h-6 w-48 bg-gray-200 rounded mx-auto"></div>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function MockPaymentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <MockPaymentContent />
    </Suspense>
  );
}
