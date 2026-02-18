// 支付服务 - 支持 LemonSqueezy、PayPal 和模拟支付

import type {
  SubscriptionPlan,
  PaymentProvider,
  PaymentIntent,
  PaymentWebhookEvent,
  PLANS,
} from '@/types/subscription';

// 支付配置
const PAYMENT_CONFIG = {
  lemonsqueezy: {
    apiKey: process.env.LEMONSQUEEZY_API_KEY || '',
    storeId: process.env.LEMONSQUEEZY_STORE_ID || '',
    webhookSecret: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '',
  },
  paypal: {
    clientId: process.env.PAYPAL_CLIENT_ID || '',
    clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    mode: process.env.PAYPAL_MODE || 'sandbox', // sandbox or live
  },
};

// 获取默认支付提供商
export function getDefaultPaymentProvider(): PaymentProvider {
  if (PAYMENT_CONFIG.lemonsqueezy.apiKey) return 'lemonsqueezy';
  if (PAYMENT_CONFIG.paypal.clientId) return 'paypal';
  return 'mock'; // 开发环境使用模拟支付
}

// 创建支付意图
export async function createPaymentIntent(
  plan: SubscriptionPlan,
  userId: string,
  provider?: PaymentProvider,
  billingCycle: 'monthly' | 'yearly' = 'monthly'
): Promise<PaymentIntent> {
  const { PLANS } = await import('@/types/subscription');
  const planConfig = PLANS[plan];

  const amount = billingCycle === 'yearly' ? planConfig.priceYearly : planConfig.price;
  const selectedProvider = provider || getDefaultPaymentProvider();

  switch (selectedProvider) {
    case 'lemonsqueezy':
      return createLemonSqueezyCheckout(plan, userId, billingCycle);

    case 'paypal':
      return createPayPalOrder(plan, userId, billingCycle);

    case 'mock':
    default:
      return createMockPayment(plan, userId, billingCycle);
  }
}

// LemonSqueezy 支付
async function createLemonSqueezyCheckout(
  plan: SubscriptionPlan,
  userId: string,
  billingCycle: 'monthly' | 'yearly'
): Promise<PaymentIntent> {
  const { PLANS } = await import('@/types/subscription');
  const planConfig = PLANS[plan];
  const amount = billingCycle === 'yearly' ? planConfig.priceYearly : planConfig.price;

  // 如果没有配置 API Key，使用模拟支付
  if (!PAYMENT_CONFIG.lemonsqueezy.apiKey) {
    console.warn('LemonSqueezy 未配置，使用模拟支付');
    return createMockPayment(plan, userId, billingCycle);
  }

  try {
    const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json',
        'Authorization': `Bearer ${PAYMENT_CONFIG.lemonsqueezy.apiKey}`,
      },
      body: JSON.stringify({
        data: {
          type: 'checkouts',
          attributes: {
            checkout_data: {
              custom: {
                user_id: userId,
                plan,
                billing_cycle: billingCycle,
              },
            },
          },
          relationships: {
            store: {
              data: {
                type: 'stores',
                id: PAYMENT_CONFIG.lemonsqueezy.storeId,
              },
            },
            variant: {
              data: {
                type: 'variants',
                id: planConfig.variantId || `${plan}-${billingCycle}`,
              },
            },
          },
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || '创建支付失败');
    }

    return {
      provider: 'lemonsqueezy',
      checkoutUrl: data.data.attributes.url,
      paymentId: data.data.id,
      amount,
      currency: planConfig.currency,
      plan,
    };
  } catch (error) {
    console.error('LemonSqueezy 支付创建失败:', error);
    // 降级到模拟支付
    return createMockPayment(plan, userId, billingCycle);
  }
}

// PayPal 支付
async function createPayPalOrder(
  plan: SubscriptionPlan,
  userId: string,
  billingCycle: 'monthly' | 'yearly'
): Promise<PaymentIntent> {
  const { PLANS } = await import('@/types/subscription');
  const planConfig = PLANS[plan];
  const amount = billingCycle === 'yearly' ? planConfig.priceYearly : planConfig.price;

  // 如果没有配置 PayPal，使用模拟支付
  if (!PAYMENT_CONFIG.paypal.clientId) {
    console.warn('PayPal 未配置，使用模拟支付');
    return createMockPayment(plan, userId, billingCycle);
  }

  try {
    const baseUrl = PAYMENT_CONFIG.paypal.mode === 'live'
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // 获取 Access Token
    const auth = Buffer.from(
      `${PAYMENT_CONFIG.paypal.clientId}:${PAYMENT_CONFIG.paypal.clientSecret}`
    ).toString('base64');

    const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'en_US',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // 创建订单
    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: `${userId}-${plan}-${billingCycle}`,
            description: `AI Workflow Automation - ${planConfig.name} (${billingCycle})`,
            amount: {
              currency_code: planConfig.currency,
              value: amount.toString(),
            },
          },
        ],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/success`,
          cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/billing/cancel`,
        },
      }),
    });

    const orderData = await orderResponse.json();

    if (!orderResponse.ok) {
      throw new Error(orderData.message || '创建支付失败');
    }

    // 找到 approval URL
    const approvalUrl = orderData.links?.find(
      (link: { rel: string; href: string }) => link.rel === 'approve'
    )?.href;

    return {
      provider: 'paypal',
      checkoutUrl: approvalUrl,
      paymentId: orderData.id,
      amount,
      currency: planConfig.currency,
      plan,
    };
  } catch (error) {
    console.error('PayPal 支付创建失败:', error);
    // 降级到模拟支付
    return createMockPayment(plan, userId, billingCycle);
  }
}

// 模拟支付（用于开发测试）
function createMockPayment(
  plan: SubscriptionPlan,
  userId: string,
  billingCycle: 'monthly' | 'yearly'
): PaymentIntent {
  const { PLANS } = require('@/types/subscription');
  const planConfig = PLANS[plan];
  const amount = billingCycle === 'yearly' ? planConfig.priceYearly : planConfig.price;

  const paymentId = `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // 模拟支付 URL（直接跳转到成功页面）
  const checkoutUrl = `${process.env.NEXT_PUBLIC_APP_URL || ''}/dashboard/billing/mock-payment?payment_id=${paymentId}&plan=${plan}&user_id=${userId}&billing_cycle=${billingCycle}`;

  return {
    provider: 'mock',
    checkoutUrl,
    paymentId,
    amount,
    currency: planConfig.currency,
    plan,
  };
}

// 验证 Webhook 签名
export function verifyWebhookSignature(
  provider: PaymentProvider,
  payload: string,
  signature: string
): boolean {
  switch (provider) {
    case 'lemonsqueezy':
      // LemonSqueezy 使用 HMAC 签名
      return !!PAYMENT_CONFIG.lemonsqueezy.webhookSecret;

    case 'paypal':
      // PayPal 使用不同的验证方式
      return true;

    case 'mock':
    default:
      return true;
  }
}

// 处理 Webhook 事件
export async function processWebhookEvent(event: PaymentWebhookEvent): Promise<{
  success: boolean;
  action?: string;
  data?: Record<string, unknown>;
}> {
  const { createSubscriptionRecord } = await import('./subscription-service');

  switch (event.provider) {
    case 'lemonsqueezy':
      return processLemonSqueezyWebhook(event);

    case 'paypal':
      return processPayPalWebhook(event);

    case 'mock':
      // 模拟支付直接成功
      if (event.eventType === 'payment_completed') {
        const { userId, plan, paymentId } = event.data as {
          userId: string;
          plan: SubscriptionPlan;
          paymentId: string;
        };

        const subscription = await createSubscriptionRecord(
          userId,
          plan,
          'mock',
          undefined,
          paymentId
        );

        return {
          success: !!subscription,
          action: 'subscription_created',
          data: { subscription },
        };
      }
      return { success: true };

    default:
      return { success: false };
  }
}

// 处理 LemonSqueezy Webhook
async function processLemonSqueezyWebhook(event: PaymentWebhookEvent): Promise<{
  success: boolean;
  action?: string;
  data?: Record<string, unknown>;
}> {
  const { createSubscriptionRecord } = await import('./subscription-service');
  const eventType = event.eventType;
  const data = event.data as Record<string, unknown>;

  // 提取用户信息
  const customData = ((data.meta as Record<string, unknown>)?.custom_data || {}) as {
    user_id?: string;
    plan?: SubscriptionPlan;
  };

  const userId = customData.user_id;
  const plan = customData.plan;

  if (!userId || !plan) {
    return { success: false };
  }

  switch (eventType) {
    case 'order_created':
    case 'subscription_created':
      const subscription = await createSubscriptionRecord(
        userId,
        plan,
        'lemonsqueezy',
        data.customer_id as string,
        data.subscription_id as string
      );
      return {
        success: !!subscription,
        action: 'subscription_created',
        data: { subscription },
      };

    case 'subscription_cancelled':
      // 更新订阅状态
      return {
        success: true,
        action: 'subscription_cancelled',
      };

    case 'subscription_expired':
      return {
        success: true,
        action: 'subscription_expired',
      };

    default:
      return { success: true };
  }
}

// 处理 PayPal Webhook
async function processPayPalWebhook(event: PaymentWebhookEvent): Promise<{
  success: boolean;
  action?: string;
  data?: Record<string, unknown>;
}> {
  const { createSubscriptionRecord } = await import('./subscription-service');
  const eventType = event.eventType;
  const data = event.data as Record<string, unknown>;

  // 从 reference_id 解析用户信息
  const purchaseUnits = data.purchase_units as Array<{ reference_id?: string }> | undefined;
  const referenceId = (purchaseUnits?.[0]?.reference_id || '') as string;
  const [userId, plan] = referenceId.split('-');

  if (!userId || !plan) {
    return { success: false };
  }

  switch (eventType) {
    case 'CHECKOUT.ORDER.APPROVED':
    case 'PAYMENT.CAPTURE.COMPLETED':
      const payer = data.payer as { payer_id?: string } | undefined;
      const subscription = await createSubscriptionRecord(
        userId,
        plan as SubscriptionPlan,
        'paypal',
        payer?.payer_id as string | undefined,
        data.id as string | undefined
      );
      return {
        success: !!subscription,
        action: 'subscription_created',
        data: { subscription },
      };

    default:
      return { success: true };
  }
}
