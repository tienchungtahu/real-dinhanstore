import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const locales = ['vi', 'en', 'zh', 'ja', 'ko'] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
  zh: '中文',
  ja: '日本語',
  ko: '한국어',
};

export const localeFlags: Record<Locale, string> = {
  vi: '🇻🇳',
  en: '🇺🇸',
  zh: '🇨🇳',
  ja: '🇯🇵',
  ko: '🇰🇷',
};

export const routing = defineRouting({
  locales,
  defaultLocale: 'vi',
  localePrefix: 'never'
});

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
