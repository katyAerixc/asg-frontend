/**
 * 語系
 *
 * 做什麼：記住使用者選的語言，換網址（/en、/ja…）並換掉整站文字。
 *
 * 實際幹活的是 @nuxtjs/i18n（設定在 nuxt.config.ts 的 i18n）：
 *   - 存在 cookie asg-locale → server 渲染時就知道要哪個語言
 *   - 第一次進站沒有 cookie 時才看瀏覽器語言，之後永遠尊重使用者手動選的
 *   - strategy 是 prefix_except_default：繁中是 /、其他語言是 /en、/ja…
 *
 * 這一支只是薄薄一層包裝，讓選單那邊不用直接碰套件的 API。
 * 語言清單的單一真相在 nuxt.config.ts 的 LOCALES，不要在這裡再列一份。
 */

export type LocaleCode = 'en' | 'ja' | 'ko' | 'th' | 'vi' | 'zh-CN' | 'zh-TW';

export function useLocale() {
    const { locale, setLocale } = useI18n();

    // Functions
    // setLocale 會順便把網址換成該語言的版本，所以不用自己 navigateTo
    function applyLocale(next: LocaleCode) {
        setLocale(next);
    }

    return {
        applyLocale,
        locale: locale as Ref<LocaleCode>,
    };
}
