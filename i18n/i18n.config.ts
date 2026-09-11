// vue-i18n 本身的設定。fallbackLocale 只能放這裡，nuxt.config 的 i18n 區塊沒有這個欄位
export default defineI18nConfig(() => ({
    // 某個語言少了 key 就退回繁中，畫面不會印出 key 本身（例如 support.title）
    fallbackLocale: 'zh-TW',
}));
