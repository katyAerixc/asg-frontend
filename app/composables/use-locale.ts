/**
 * 語系
 *
 * 做什麼：記住使用者選的語言，並寫進 <html lang="...">（給搜尋引擎與讀螢幕軟體看）。
 *
 * ⚠️ 這支只管「選了哪個語言」，還不會真的翻譯文字。
 *    真正的翻譯要另外裝 i18n 套件並準備 7 份文案，之後接上時只要在這裡多呼叫一行切換即可。
 */

const STORAGE_KEY = 'asg-locale';

// 對應設計稿的七種語言；code 用標準寫法，之後接 i18n 直接可用
export const LOCALE_CODES = [
    'zh-TW',
    'zh-CN',
    'ja',
    'ko',
    'en',
    'th',
    'vi',
] as const;

export type LocaleCode = typeof LOCALE_CODES[number];

// 放在函式外面：全站共用同一份狀態
const locale = ref<LocaleCode>('zh-TW');

export function useLocale() {
    function applyLocale(next: LocaleCode) {
        locale.value = next;

        if (import.meta.client) {
            document.documentElement.lang = next;

            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // 記不住不影響當下切換
            }
        }
    }

    function restoreLocale() {
        if (!import.meta.client) return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY) as LocaleCode | null;

            if (saved && LOCALE_CODES.includes(saved)) applyLocale(saved);
            else applyLocale(locale.value);
        } catch {
            applyLocale(locale.value);
        }
    }

    return {
        applyLocale,
        locale,
        restoreLocale,
    };
}
