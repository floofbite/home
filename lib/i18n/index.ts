/**
 * 简单国际化 (i18n) 方案
 * 当前仅支持中文，预留多语言扩展
 */

import { zh } from "./zh";

export const translations = {
  zh,
} as const;

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof zh;

const defaultLang: Language = "zh";

/**
 * 获取翻译
 */
export function t(
  key: string,
  params?: Record<string, string>
): string {
  const lang = defaultLang;
  const translation = translations[lang];

  // 支持嵌套路径，如 "common.save"
  const value = key.split(".").reduce<unknown>((obj, k) => {
    if (obj && typeof obj === "object" && k in obj) {
      return (obj as Record<string, unknown>)[k];
    }
    return undefined;
  }, translation);

  let result = typeof value === "string" ? value : key;

  // 替换参数
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      result = result.replace(new RegExp(`{${k}}`, "g"), v);
    });
  }

  return result;
}

/**
 * React Hook for translations
 */
export function useTranslations() {
  return { t };
}
