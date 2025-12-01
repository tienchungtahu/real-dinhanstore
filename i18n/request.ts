import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';
import { routing, locales, type Locale } from './routing';

export { locales };
export const defaultLocale: Locale = 'vi';

export default getRequestConfig(async ({ requestLocale }) => {
  // Try to get locale from cookie first
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  
  let locale = cookieLocale || (await requestLocale);

  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
