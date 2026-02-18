'use client';

import { useLocale } from '@/contexts/locale-context';
import { Button } from '@/components/ui/button';

export function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setLocale(locale === 'en' ? 'zh' : 'en')}
      className="text-sm font-medium"
    >
      {locale === 'en' ? '中文' : 'EN'}
    </Button>
  );
}
