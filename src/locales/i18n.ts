// ============================================
//  src/locales/i18n.ts
//  نقطة دخول واحدة للترجمة. التطبيق عربي RTL فقط حالياً،
//  لكن هذا الهيكل يسمح بإضافة لغات أخرى لاحقاً بسهولة
//  (نفس فكرة locales/ المستخدمة في تطبيق Café Manager)
// ============================================

import { I18nManager } from 'react-native';
import { ar } from './ar';

export const t = ar;

export const currentLocale = 'ar';
export const isRTL = true;

/** يفرض اتجاه RTL على مستوى التطبيق بالكامل (يُستدعى مرة واحدة عند الإقلاع) */
export function enforceRTL(): void {
  if (!I18nManager.isRTL) {
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(true);
  }
}
