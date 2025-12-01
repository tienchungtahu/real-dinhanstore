export const locales = {
  VI: "vi",
  EN: "en",
  ZH: "zh",
  JA: "ja",
  KO: "ko",
} as const;

export const DEFAULT_LOCALE = locales.VI;

export const localesList = [locales.VI, locales.EN, locales.ZH, locales.JA, locales.KO] as const;

export const localeOptionsList = [
  { value: locales.VI, label: "🇻🇳 Tiếng Việt" },
  { value: locales.EN, label: "🇺🇸 English" },
  { value: locales.ZH, label: "🇨🇳 中文" },
  { value: locales.JA, label: "🇯🇵 日本語" },
  { value: locales.KO, label: "🇰🇷 한국어" },
] as const;
