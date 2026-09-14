/**
 * 遊戲清單資料層
 *
 * 資料從 libs/api/game.ts 來（假的或真的由 .env 的 NUXT_PUBLIC_USE_MOCK 決定，這裡不用知道）。
 * 頁面與組件只認 Game 這個格式，接後端時它們都不用動。
 */

import { fetchGames } from '@/libs/api/game';

export function useGames() {
    const {
        data: games,
        error,
        status,
    } = useAsyncData('games', () => fetchGames(), { default: () => [] });

    // 畫面用它顯示載入中
    const pending = computed(() => status.value === 'pending');

    return {
        error,
        games,
        pending,
    };
}
