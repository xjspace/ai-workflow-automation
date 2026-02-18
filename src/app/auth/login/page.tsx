'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// 强制动态渲染
export const dynamic = 'force-dynamic';
import { useAuth } from '@/hooks/use-auth';
import { useLocale } from '@/contexts/locale-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { signIn, signUp, signInWithOAuth } = useAuth();
  const { t, locale } = useLocale();
  const router = useRouter();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await signIn(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await signUp(email, password);

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(t('auth.register.checkEmail'));
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github' | 'apple') => {
    setOauthLoading(provider);
    setError('');

    const { error } = await signInWithOAuth(provider);

    if (error) {
      setError(error.message);
      setOauthLoading(null);
    }
    // OAuth 会重定向，所以不需要设置 loading 为 false
  };

  const OAuthButtons = () => (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">{t('auth.oauth.or')}</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          type="button"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuth('google')}
          className="w-full"
        >
          {oauthLoading === 'google' ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>🔵</span>
          )}
          <span className="ml-2 hidden sm:inline">{t('auth.oauth.google')}</span>
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuth('github')}
          className="w-full"
        >
          {oauthLoading === 'github' ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>⚫</span>
          )}
          <span className="ml-2 hidden sm:inline">{t('auth.oauth.github')}</span>
        </Button>

        <Button
          variant="outline"
          type="button"
          disabled={oauthLoading !== null}
          onClick={() => handleOAuth('apple')}
          className="w-full"
        >
          {oauthLoading === 'apple' ? (
            <span className="animate-spin">⏳</span>
          ) : (
            <span>🍎</span>
          )}
          <span className="ml-2 hidden sm:inline">{t('auth.oauth.apple')}</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-3xl">🤖</span>
            <span className="text-2xl font-bold">AI Workflow</span>
          </div>
          <CardDescription>{t('landing.hero.subtitle')}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">{t('auth.tabs.login')}</TabsTrigger>
              <TabsTrigger value="register">{t('auth.tabs.register')}</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-4">
              <form onSubmit={handleSignIn} className="space-y-4">
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
                <div className="space-y-2">
                  <Label htmlFor="password">{t('auth.login.password')}</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.login.logging') : t('auth.login.submit')}
                </Button>
                <div className="text-center">
                  <a
                    href="/auth/forgot-password"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {locale === 'en' ? 'Forgot password?' : '忘记密码？'}
                  </a>
                </div>
              </form>

              <OAuthButtons />
            </TabsContent>

            <TabsContent value="register" className="space-y-4">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-email">{t('auth.login.email')}</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">{t('auth.login.password')}</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                {success && <p className="text-sm text-green-600">{success}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('auth.register.registering') : t('auth.register.submit')}
                </Button>
              </form>

              <OAuthButtons />
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-gray-500">
            <p>{t('auth.pricing.free')}</p>
            <p>{t('auth.pricing.pro')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
