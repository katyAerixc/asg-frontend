// 搜尋引擎的爬蟲通常不帶 Accept-Language（Googlebot 從美國爬、不設語言）。
// i18n 收到空的標頭會當成「認不出語言」退回英文，把首頁 / 轉到 /en
// → 繁中首頁永遠爬不到，hreflang 標的 zh-TW 網址跟 /en 變成同一頁。
// 沒帶標頭 = 不用猜，補上預設語言讓 / 留在繁中；真的帶了不支援的語言（法文等）照舊退回英文
export default defineEventHandler((event) => {
    if (getRequestHeader(event, 'accept-language')) return;

    event.node.req.headers['accept-language'] = useRuntimeConfig(event).public.i18n.defaultLocale;
});
