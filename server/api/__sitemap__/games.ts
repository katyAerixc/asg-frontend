// 網站地圖裡的遊戲頁網址：@nuxtjs/sitemap 只認得固定頁面，/game/:id 要由這裡列給它（nuxt.config 的 sitemap.sources）
// 預設關著：遊戲頁目前只有遊戲圖和一行「遊玩 ○○」，字太少被收錄會被當成低品質頁面
// 有遊戲介紹文後，在 .env 加 NUXT_SITEMAP_GAMES_ENABLED=true 就會列出來，不用改程式
import type { Game } from '../../../app/types/game';

// 假資料 12 款、id 1–12（app/libs/api/mock/games.ts）；那個檔會 import 圖片，伺服器端讀不了，所以這裡只放 id
// ⚠️ 接 API 後跟 mock/ 一起刪
const MOCK_GAME_IDS = Array.from({ length: 12 }, (_, index) => ({ id: index + 1 }));

export default defineEventHandler(async () => {
    const {
        public: {
            apiBase,
            useMock,
        },
        sitemapGames,
    } = useRuntimeConfig();

    if (!sitemapGames.enabled) return [];

    // ⚠️ 路徑（/games）跟前端 libs/api/game.ts 一樣是暫定的，後端給規格時兩邊一起改
    const games = useMock ? MOCK_GAME_IDS : await $fetch<Pick<Game, 'id'>[]>('/games', { baseURL: apiBase });

    // 預設語言沒有前綴（/game/1），其他語言是 /en/game/1
    return games.flatMap((game) => sitemapGames.locales.map((locale: string) => {
        const prefix = locale === sitemapGames.defaultLocale ? '' : `/${locale}`;

        return { loc: `${prefix}/game/${game.id}` };
    }));
});
