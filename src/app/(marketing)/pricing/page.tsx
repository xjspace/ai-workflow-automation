'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/contexts/locale-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PLANS, type SubscriptionPlan } from '@/types/subscription';

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { locale } = useLocale();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null);

  const handleSelectPlan = async (plan: SubscriptionPlan) => {
    if (!user) {
      router.push('/auth/login');
      return;
    }

    if (plan === 'free') {
      router.push('/dashboard');
      return;
    }

    if (plan === 'enterprise') {
      // 跳转到联系销售
      window.location.href = 'mailto:sales@takeovers.work?subject=Enterprise Plan Inquiry';
      return;
    }

    setLoading(plan);

    try {
      const response = await fetch('/api/billing/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, billingCycle }),
      });

      const data = await response.json();

      if (data.paymentIntent?.checkoutUrl) {
        window.location.href = data.paymentIntent.checkoutUrl;
      } else if (data.message) {
        alert(data.message);
        setLoading(null);
      }
    } catch (error) {
      console.error('创建支付失败:', error);
      setLoading(null);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return locale === 'en' ? 'Free' : '免费';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            {locale === 'en' ? 'Simple, Transparent Pricing' : '简单透明的定价'}
          </h1>
          <p className="text-gray-600 text-lg mb-8">
            {locale === 'en'
              ? 'Choose the plan that fits your needs. Upgrade or downgrade anytime.'
              : '选择适合您需求的套餐。随时升级或降级。'}
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-gray-500'}>
              {locale === 'en' ? 'Monthly' : '按月'}
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className="relative w-14 h-7 bg-gray-300 rounded-full transition-colors"
              style={{ backgroundColor: billingCycle === 'yearly' ? '#3b82f6' : undefined }}
            >
              <span
                className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform"
                style={{ transform: billingCycle === 'yearly' ? 'translateX(28px)' : undefined }}
              />
            </button>
            <span className={billingCycle === 'yearly' ? 'font-semibold' : 'text-gray-500'}>
              {locale === 'en' ? 'Yearly' : '按年'}
              <span className="ml-2 text-green-600 text-sm font-normal">
                {locale === 'en' ? '(Save 17%)' : '(省17%)'}
              </span>
            </span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {(Object.entries(PLANS) as [SubscriptionPlan, typeof PLANS.free][]).map(([key, plan]) => (
            <Card
              key={key}
              className={`relative ${
                key === 'pro' ? 'border-blue-500 border-2 shadow-lg' : ''
              }`}
            >
              {key === 'pro' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-3 py-1 rounded-full">
                  {locale === 'en' ? 'Most Popular' : '最受欢迎'}
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle>{locale === 'en' ? plan.name : plan.nameZh}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">
                    {formatPrice(
                      billingCycle === 'yearly' ? plan.priceYearly : plan.price,
                      plan.currency
                    )}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-gray-500">
                      /{locale === 'en' ? (billingCycle === 'monthly' ? 'mo' : 'yr') : (billingCycle === 'monthly' ? '月' : '年')}
                    </span>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {key === 'enterprise'
                    ? locale === 'en'
                      ? 'Contact for pricing'
                      : '联系获取报价'
                    : ''}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {(locale === 'en' ? plan.features : plan.featuresZh).map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">✓</span>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(key)}
                  className="w-full"
                  variant={key === 'pro' ? 'default' : 'outline'}
                  disabled={loading !== null}
                >
                  {loading === key ? (
                    <span className="animate-spin mr-2">⏳</span>
                  ) : null}
                  {key === 'enterprise'
                    ? locale === 'en'
                      ? 'Contact Sales'
                      : '联系销售'
                    : key === 'free'
                    ? locale === 'en'
                      ? 'Get Started'
                      : '开始使用'
                    : locale === 'en'
                    ? 'Subscribe'
                    : '订阅'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-8">
            {locale === 'en' ? 'Frequently Asked Questions' : '常见问题'}
          </h2>
          <div className="grid md:grid-cols-2 gap-6 text-left max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === 'en' ? 'Can I change my plan?' : '可以更换套餐吗？'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {locale === 'en'
                    ? 'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.'
                    : '可以！您可以随时升级或降级套餐。更改立即生效。'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === 'en' ? 'What payment methods?' : '支持哪些支付方式？'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {locale === 'en'
                    ? 'We accept credit cards, PayPal, and other major payment methods through LemonSqueezy.'
                    : '我们通过 LemonSqueezy 支持信用卡、PayPal 等主流支付方式。'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === 'en' ? 'Is there a refund policy?' : '有退款政策吗？'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {locale === 'en'
                    ? 'Yes, we offer a 14-day money-back guarantee for all paid plans.'
                    : '是的，所有付费套餐均提供14天退款保证。'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {locale === 'en' ? 'Need more help?' : '需要更多帮助？'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {locale === 'en'
                    ? 'Contact our support team at support@takeovers.work'
                    : '联系我们的支持团队：support@takeovers.work'}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
