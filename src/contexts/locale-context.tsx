'use client';

import { createContext, useContext, useCallback, ReactNode, useMemo, useSyncExternalStore } from 'react';
import { Locale, t, formatRelativeTime, DEFAULT_LOCALE } from '@/lib/i18n';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
  formatRelativeTime: (dateString: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

// 使用 useSyncExternalStore 来安全地读取 localStorage
function subscribe(callback: () => void) {
  window.addEventListener('localeChange', callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('localeChange', callback);
    window.removeEventListener('storage', callback);
  };
}

function getSnapshot(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  const savedLocale = localStorage.getItem('locale') as Locale;
  if (savedLocale && (savedLocale === 'en' || savedLocale === 'zh')) {
    return savedLocale;
  }

  // 根据浏览器语言自动检测
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('zh')) {
    return 'zh';
  }
  return 'en';
}

function getServerSnapshot(): Locale {
  return DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  // 使用 useSyncExternalStore 订阅 localStorage 变化
  const locale = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setLocale = useCallback((newLocale: Locale) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', newLocale);
      // 触发自定义事件以通知其他组件
      window.dispatchEvent(new CustomEvent('localeChange', { detail: newLocale }));
    }
  }, []);

  // 使用 useMemo 优化 context value
  const contextValue = useMemo(() => ({
    locale,
    setLocale,
    t: (key: string) => t(key, locale),
    formatRelativeTime: (dateString: string) => formatRelativeTime(dateString, locale),
  }), [locale, setLocale]);

  return (
    <LocaleContext.Provider value={contextValue}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
