// 订阅与计费类型定义

// 订阅计划
export type SubscriptionPlan = 'free' | 'pro' | 'team' | 'enterprise';

// 订阅状态
export type SubscriptionStatus = 'active' | 'canceled' | 'past_due' | 'expired' | 'trialing';

// 支付提供商
export type PaymentProvider = 'lemonsqueezy' | 'paypal' | 'mock';

// 计划配置
export const PLANS: Record<SubscriptionPlan, {
  name: string;
  nameZh: string;
  price: number;
  priceYearly: number;
  currency: string;
  features: string[];
  featuresZh: string[];
  limits: {
    maxWorkflows: number; // -1 = unlimited
    maxExecutions: number;
    maxTeamMembers: number;
    aiCredits: number;
  };
  variantId?: string; // LemonSqueezy variant ID
}> = {
  free: {
    name: 'Free',
    nameZh: '免费版',
    price: 0,
    priceYearly: 0,
    currency: 'USD',
    features: [
      '5 workflows',
      '100 executions/month',
      'Basic AI nodes',
      'Community support',
    ],
    featuresZh: [
      '5 个工作流',
      '每月 100 次执行',
      '基础 AI 节点',
      '社区支持',
    ],
    limits: {
      maxWorkflows: 5,
      maxExecutions: 100,
      maxTeamMembers: 1,
      aiCredits: 100,
    },
  },
  pro: {
    name: 'Pro',
    nameZh: '专业版',
    price: 29,
    priceYearly: 290, // ~17% discount
    currency: 'USD',
    features: [
      'Unlimited workflows',
      '5,000 executions/month',
      'Advanced AI nodes',
      'Priority support',
      'Custom webhooks',
      'API access',
    ],
    featuresZh: [
      '无限工作流',
      '每月 5,000 次执行',
      '高级 AI 节点',
      '优先支持',
      '自定义 Webhook',
      'API 访问',
    ],
    limits: {
      maxWorkflows: -1,
      maxExecutions: 5000,
      maxTeamMembers: 1,
      aiCredits: 5000,
    },
    variantId: 'pro-monthly',
  },
  team: {
    name: 'Team',
    nameZh: '团队版',
    price: 99,
    priceYearly: 990,
    currency: 'USD',
    features: [
      'Everything in Pro',
      '20,000 executions/month',
      '5 team members',
      'Team collaboration',
      'Admin dashboard',
      'SSO support',
    ],
    featuresZh: [
      '包含专业版所有功能',
      '每月 20,000 次执行',
      '5 个团队成员',
      '团队协作',
      '管理后台',
      'SSO 支持',
    ],
    limits: {
      maxWorkflows: -1,
      maxExecutions: 20000,
      maxTeamMembers: 5,
      aiCredits: 20000,
    },
    variantId: 'team-monthly',
  },
  enterprise: {
    name: 'Enterprise',
    nameZh: '企业版',
    price: 0, // Contact sales
    priceYearly: 0,
    currency: 'USD',
    features: [
      'Everything in Team',
      'Unlimited executions',
      'Unlimited team members',
      'Dedicated support',
      'Custom integrations',
      'SLA guarantee',
      'On-premise option',
    ],
    featuresZh: [
      '包含团队版所有功能',
      '无限执行次数',
      '无限团队成员',
      '专属支持',
      '定制集成',
      'SLA 保证',
      '私有化部署',
    ],
    limits: {
      maxWorkflows: -1,
      maxExecutions: -1,
      maxTeamMembers: -1,
      aiCredits: -1,
    },
  },
};

// 用户订阅
export interface UserSubscription {
  id: string;
  user_id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  payment_provider: PaymentProvider;
  customer_id?: string; // 外部支付系统的客户ID
  subscription_id?: string; // 外部订阅ID
  created_at: string;
  updated_at: string;
}

// 订单
export interface Order {
  id: string;
  user_id: string;
  subscription_id?: string;
  plan: SubscriptionPlan;
  amount: number;
  currency: string;
  status: 'pending' | 'paid' | 'failed' | 'refunded' | 'canceled';
  payment_provider: PaymentProvider;
  payment_id?: string; // 外部支付ID
  invoice_url?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// 账单/发票
export interface Invoice {
  id: string;
  user_id: string;
  order_id: string;
  number: string; // 发票号
  amount: number;
  currency: string;
  status: 'draft' | 'open' | 'paid' | 'void';
  due_date: string;
  paid_at?: string;
  invoice_url: string;
  created_at: string;
}

// 使用量统计
export interface UsageStats {
  user_id: string;
  period: string; // YYYY-MM
  workflow_count: number;
  execution_count: number;
  ai_credits_used: number;
  created_at: string;
  updated_at: string;
}

// 支付意图（用于创建支付）
export interface PaymentIntent {
  provider: PaymentProvider;
  checkoutUrl?: string;
  paymentId: string;
  amount: number;
  currency: string;
  plan: SubscriptionPlan;
}

// Webhook 事件
export interface PaymentWebhookEvent {
  provider: PaymentProvider;
  eventType: string;
  data: Record<string, unknown>;
  timestamp: string;
}
