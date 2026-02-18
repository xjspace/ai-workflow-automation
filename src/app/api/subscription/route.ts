import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import {
  getUserSubscription,
  getUserUsage,
  getDashboardData,
  cancelSubscription,
} from '@/lib/subscription-service';

// 获取用户订阅信息
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 获取仪表盘数据
    const dashboardData = await getDashboardData(user.id);

    return NextResponse.json({
      subscription: dashboardData.subscription,
      usage: dashboardData.usage,
      recentOrders: dashboardData.recentOrders,
    });
  } catch (error) {
    console.error('获取订阅信息失败:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription' },
      { status: 500 }
    );
  }
}

// 取消订阅
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const success = await cancelSubscription(user.id);

    if (success) {
      return NextResponse.json({ success: true, message: 'Subscription cancelled' });
    } else {
      return NextResponse.json(
        { error: 'Failed to cancel subscription' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('取消订阅失败:', error);
    return NextResponse.json(
      { error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
