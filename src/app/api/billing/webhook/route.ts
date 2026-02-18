import { NextRequest, NextResponse } from 'next/server';
import {
  verifyWebhookSignature,
  processWebhookEvent,
} from '@/lib/payment-service';
import type { PaymentProvider, PaymentWebhookEvent } from '@/types/subscription';

export async function POST(request: NextRequest) {
  try {
    // 获取请求体
    const payload = await request.text();

    // 确定支付提供商
    const provider = request.headers.get('x-payment-provider') as PaymentProvider || 'mock';

    // 获取签名（不同提供商使用不同的 header）
    const signature =
      request.headers.get('x-signature') ||
      request.headers.get('x-lemonsqueezy-signature') ||
      request.headers.get('paypal-transmission-sig') ||
      '';

    // 验证签名
    if (!verifyWebhookSignature(provider, payload, signature)) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // 解析事件数据
    let eventData: Record<string, unknown>;
    try {
      eventData = JSON.parse(payload);
    } catch {
      eventData = { raw: payload };
    }

    // 构建 Webhook 事件
    const event: PaymentWebhookEvent = {
      provider,
      eventType:
        (eventData.event_name as string) ||
        (eventData.event_type as string) ||
        'unknown',
      data: eventData,
      timestamp: new Date().toISOString(),
    };

    // 处理事件
    const result = await processWebhookEvent(event);

    if (result.success) {
      return NextResponse.json({ received: true, action: result.action });
    } else {
      return NextResponse.json(
        { error: 'Failed to process webhook' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Webhook 处理失败:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// 处理 LemonSqueezy Webhook (特定路由)
export async function GET(request: NextRequest) {
  // 验证 Webhook 端点是否正常
  const searchParams = request.nextUrl.searchParams;
  const challenge = searchParams.get('hub.challenge');

  if (challenge) {
    // LemonSqueezy 验证挑战
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ status: 'ok' });
}
