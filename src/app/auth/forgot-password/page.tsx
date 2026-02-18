'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/contexts/locale-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const { t, locale } = useLocale();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await resetPassword(email);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-3xl">📧</span>
            </div>
            <CardTitle>
              {locale === 'en' ? 'Check Your Email' : '检查你的邮箱'}
            </CardTitle>
            <CardDescription>
              {locale === 'en'
                ? 'We sent a password reset link to'
                : '我们已发送密码重置链接到'}
              <br />
              <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-gray-500 mb-4">
              {locale === 'en'
                ? "Didn't receive the email? Check your spam folder or"
                : '没收到邮件？检查垃圾邮件或'}
            </p>
            <Button variant="outline" onClick={() => setSuccess(false)}>
              {locale === 'en' ? 'Try again' : '重试'}
            </Button>
            <div className="mt-4">
              <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
                {locale === 'en' ? '← Back to login' : '← 返回登录'}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🔑</span>
            <span className="text-2xl font-bold">AI Workflow</span>
          </div>
          <CardTitle>
            {locale === 'en' ? 'Forgot Password?' : '忘记密码？'}
          </CardTitle>
          <CardDescription>
            {locale === 'en'
              ? 'Enter your email and we will send you a reset link'
              : '输入你的邮箱，我们将发送重置链接'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.login.email')}</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? (locale === 'en' ? 'Sending...' : '发送中...')
                : (locale === 'en' ? 'Send Reset Link' : '发送重置链接')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link href="/auth/login" className="text-sm text-blue-600 hover:underline">
              {locale === 'en' ? '← Back to login' : '← 返回登录'}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
