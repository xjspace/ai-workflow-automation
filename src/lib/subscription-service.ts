// 订阅服务 - 处理订阅逻辑、使用量追踪

import { supabase } from './supabase';
import type {
  SubscriptionPlan,
  UserSubscription,
  Order,
  Invoice,
  UsageStats,
  PLANS,
} from '@/types/subscription';

// 获取用户当前订阅
export async function getUserSubscription(userId: string): Promise<UserSubscription | null> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  if (error) {
    console.error('获取订阅失败:', error);
    return null;
  }

  return data;
}

// 获取用户使用量
export async function getUserUsage(userId: string): Promise<UsageStats | null> {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('usage_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('period', period)
    .single();

  if (error) {
    // 如果没有记录，返回默认值
    if (error.code === 'PGRST116') {
      return {
        user_id: userId,
        period,
        workflow_count: 0,
        execution_count: 0,
        ai_credits_used: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    console.error('获取使用量失败:', error);
    return null;
  }

  return data;
}

// 获取用户订单历史
export async function getUserOrders(userId: string): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取订单失败:', error);
    return [];
  }

  return data || [];
}

// 获取用户发票列表
export async function getUserInvoices(userId: string): Promise<Invoice[]> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('获取发票失败:', error);
    return [];
  }

  return data || [];
}

// 检查用户是否可以执行操作（基于订阅限制）
export async function checkUserLimit(
  userId: string,
  action: 'create_workflow' | 'execute' | 'ai_call'
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  // 获取用户订阅
  const subscription = await getUserSubscription(userId);
  const plan = subscription?.plan || 'free';

  // 获取计划限制
  const { PLANS } = await import('@/types/subscription');
  const planConfig = PLANS[plan];

  // 获取当前使用量
  const usage = await getUserUsage(userId);
  if (!usage) {
    return { allowed: false, reason: '无法获取使用量' };
  }

  switch (action) {
    case 'create_workflow': {
      const limit = planConfig.limits.maxWorkflows;
      if (limit === -1) return { allowed: true };
      const remaining = limit - usage.workflow_count;
      if (remaining <= 0) {
        return { allowed: false, reason: '已达到工作流数量上限', remaining: 0 };
      }
      return { allowed: true, remaining };
    }

    case 'execute': {
      const limit = planConfig.limits.maxExecutions;
      if (limit === -1) return { allowed: true };
      const remaining = limit - usage.execution_count;
      if (remaining <= 0) {
        return { allowed: false, reason: '已达到本月执行次数上限', remaining: 0 };
      }
      return { allowed: true, remaining };
    }

    case 'ai_call': {
      const limit = planConfig.limits.aiCredits;
      if (limit === -1) return { allowed: true };
      const remaining = limit - usage.ai_credits_used;
      if (remaining <= 0) {
        return { allowed: false, reason: 'AI 额度已用尽', remaining: 0 };
      }
      return { allowed: true, remaining };
    }

    default:
      return { allowed: false, reason: '未知操作' };
  }
}

// 记录使用量
export async function recordUsage(
  userId: string,
  type: 'workflow_created' | 'execution' | 'ai_call',
  amount: number = 1
): Promise<boolean> {
  const now = new Date();
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 先检查是否有记录
  const { data: existing } = await supabase
    .from('usage_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('period', period)
    .single();

  if (existing) {
    // 更新现有记录
    const updates: Record<string, number> = {};
    switch (type) {
      case 'workflow_created':
        updates.workflow_count = existing.workflow_count + amount;
        break;
      case 'execution':
        updates.execution_count = existing.execution_count + amount;
        break;
      case 'ai_call':
        updates.ai_credits_used = existing.ai_credits_used + amount;
        break;
    }

    const { error } = await supabase
      .from('usage_stats')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', existing.id);

    return !error;
  } else {
    // 创建新记录
    const newData = {
      user_id: userId,
      period,
      workflow_count: type === 'workflow_created' ? amount : 0,
      execution_count: type === 'execution' ? amount : 0,
      ai_credits_used: type === 'ai_call' ? amount : 0,
    };

    const { error } = await supabase
      .from('usage_stats')
      .insert(newData);

    return !error;
  }
}

// 创建订阅记录（支付成功后调用）
export async function createSubscriptionRecord(
  userId: string,
  plan: SubscriptionPlan,
  paymentProvider: string,
  customerId?: string,
  subscriptionId?: string
): Promise<UserSubscription | null> {
  // 先取消现有订阅
  await supabase
    .from('subscriptions')
    .update({ status: 'canceled', updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('status', 'active');

  // 计算订阅周期
  const now = new Date();
  const periodEnd = new Date(now);
  periodEnd.setMonth(periodEnd.getMonth() + 1);

  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan,
      status: 'active',
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      cancel_at_period_end: false,
      payment_provider: paymentProvider,
      customer_id: customerId,
      subscription_id: subscriptionId,
    })
    .select()
    .single();

  if (error) {
    console.error('创建订阅记录失败:', error);
    return null;
  }

  return data;
}

// 取消订阅
export async function cancelSubscription(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('subscriptions')
    .update({
      cancel_at_period_end: true,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('status', 'active');

  return !error;
}

// 获取仪表盘数据
export async function getDashboardData(userId: string): Promise<{
  subscription: UserSubscription | null;
  usage: UsageStats | null;
  recentOrders: Order[];
}> {
  const [subscription, usage, orders] = await Promise.all([
    getUserSubscription(userId),
    getUserUsage(userId),
    getUserOrders(userId).then(o => o.slice(0, 5)),
  ]);

  return { subscription, usage, recentOrders: orders };
}
