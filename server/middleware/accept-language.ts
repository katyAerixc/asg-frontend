// 搜尋引擎的爬蟲通常不帶 Accept-Language（Googlebot 從美國爬、不設語言），有時又會帶各種語言來試。
// i18n 收到空的標頭會當成「認不出語言」退回英文、帶了別的語言就轉到那個語言，兩種都會把首頁 / 轉走
// → 繁中首頁永遠爬不到，hreflang 標的 zh-TW 網址跟 /en 變成同一頁。
// 爬蟲、社群預覽機器人一律當預設語言（它們要看的是 / 本身，各語言版本 hreflang 已經告訴它們了）；
// 一般人沒帶標頭也補預設語言；真的帶了不支援的語言（法文等）照舊退回英文
const BOT_UA = /bot|crawl|spider|facebookexternalhit/i;

export default defineEventHandler((event) => {
    const isBot = BOT_UA.test(getRequestHeader(event, 'user-agent') ?? '');

    if (!isBot && getRequestHeader(event, 'accept-language')) return;

    event.node.req.headers['accept-language'] = useRuntimeConfig(event).public.i18n.defaultLocale;
});
