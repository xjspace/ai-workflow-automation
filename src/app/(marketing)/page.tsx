'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/contexts/locale-context';
import { useAuth } from '@/hooks/use-auth';
import { LocaleSwitcher } from '@/components/ui/locale-switcher';

export default function LandingPage() {
  const { t } = useLocale();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            <span className="font-bold text-xl">AI Workflow</span>
          </div>
          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">{t('nav.dashboard')}</Button>
                </Link>
                <Link href="/dashboard">
                  <Button>{t('nav.dashboard')}</Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
                  {t('nav.login')}
                </Link>
                <Link href="/auth/login">
                  <Button>{t('landing.hero.cta')}</Button>
                </Link>
              </>
            )}
            <LocaleSwitcher />
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {t('landing.hero.title')}
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          {t('landing.hero.subtitle')}
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              {t('landing.hero.cta')}
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline" className="px-8">
              {t('landing.hero.secondary')}
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-500">
          {t('auth.pricing.free')}
        </p>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">{t('landing.features.title')}</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🎨</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('landing.features.visual.title')}</h3>
            <p className="text-gray-600">
              {t('landing.features.visual.desc')}
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">🤖</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('landing.features.ai.title')}</h3>
            <p className="text-gray-600">
              {t('landing.features.ai.desc')}
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <span className="text-2xl">📦</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">{t('landing.features.templates.title')}</h3>
            <p className="text-gray-600">
              {t('landing.features.templates.desc')}
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="max-w-6xl mx-auto px-4 py-16 bg-gray-50 -mx-4 px-4">
        <h2 className="text-3xl font-bold text-center mb-12">
          {t('pricing.title')}
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">{t('pricing.free.name')}</h3>
            <div className="text-4xl font-bold mb-4">{t('pricing.free.price')}<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>✓ {t('pricing.free.feature1')}</li>
              <li>✓ {t('pricing.free.feature2')}</li>
              <li>✓ {t('pricing.free.feature3')}</li>
              <li>✓ {t('pricing.free.feature4')}</li>
            </ul>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">{t('pricing.getStarted')}</Button>
            </Link>
          </div>

          <div className="p-6 bg-white rounded-xl border-2 border-indigo-500 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-500 text-white text-sm px-3 py-1 rounded-full">
              {t('pricing.recommended')}
            </div>
            <h3 className="text-lg font-semibold mb-2">{t('pricing.pro.name')}</h3>
            <div className="text-4xl font-bold mb-4">{t('pricing.pro.price')}<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>✓ {t('pricing.pro.feature1')}</li>
              <li>✓ {t('pricing.pro.feature2')}</li>
              <li>✓ {t('pricing.pro.feature3')}</li>
              <li>✓ {t('pricing.pro.feature4')}</li>
            </ul>
            <Link href="/auth/login">
              <Button className="w-full">{t('pricing.upgrade')}</Button>
            </Link>
          </div>

          <div className="p-6 bg-white rounded-xl border border-gray-200">
            <h3 className="text-lg font-semibold mb-2">{t('pricing.team.name')}</h3>
            <div className="text-4xl font-bold mb-4">{t('pricing.team.price')}<span className="text-lg font-normal text-gray-500">/mo</span></div>
            <ul className="space-y-2 text-gray-600 mb-6">
              <li>✓ {t('pricing.team.feature1')}</li>
              <li>✓ {t('pricing.team.feature2')}</li>
              <li>✓ {t('pricing.team.feature3')}</li>
              <li>✓ {t('pricing.team.feature4')}</li>
            </ul>
            <Link href="/auth/login">
              <Button variant="outline" className="w-full">{t('pricing.contact')}</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">{t('cta.title')}</h2>
        <p className="text-gray-600 mb-8">{t('cta.subtitle')}</p>
        <Link href="/dashboard">
          <Button size="lg" className="px-12">
            {t('landing.hero.cta')} →
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-semibold">AI Workflow Automation</span>
          </div>
          <div className="flex gap-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">{t('footer.docs')}</a>
            <a href="#" className="hover:text-gray-900">{t('footer.blog')}</a>
            <a href="#" className="hover:text-gray-900">{t('footer.privacy')}</a>
            <a href="#" className="hover:text-gray-900">{t('footer.terms')}</a>
          </div>
          <div className="text-sm text-gray-500">
            © 2026 AI Workflow. {t('footer.rights')}
          </div>
        </div>
      </footer>
    </div>
  );
}
