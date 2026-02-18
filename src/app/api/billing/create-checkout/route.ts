import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { createPaymentIntent } from '@/lib/payment-service';
import type { SubscriptionPlan, PaymentProvider } from '@/types/subscription';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    // 验证用户登录
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 解析请求体
    const body = await request.json();
    const { plan, billingCycle = 'monthly', provider } = body as {
      plan: SubscriptionPlan;
      billingCycle?: 'monthly' | 'yearly';
      provider?: PaymentProvider;
    };

    // 验证计划有效性
    const validPlans = ['free', 'pro', 'team', 'enterprise'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // 免费计划不需要支付
    if (plan === 'free') {
      return NextResponse.json({
        success: true,
        message: 'Free plan activated',
      });
    }

    // 企业版需要联系销售
    if (plan === 'enterprise') {
      return NextResponse.json({
        success: true,
        message: 'Please contact sales',
        contactEmail: 'sales@takeovers.work',
      });
    }

    // 创建支付意图
    const paymentIntent = await createPaymentIntent(
      plan,
      user.id,
      provider,
      billingCycle
    );

    return NextResponse.json({
      success: true,
      paymentIntent,
    });
  } catch (error) {
    console.error('创建支付失败:', error);
    return NextResponse.json(
      { error: 'Failed to create payment' },
      { status: 500 }
    );
  }
}
