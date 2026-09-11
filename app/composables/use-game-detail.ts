// 遊戲介紹彈窗：開關與「現在看的是哪一款」
// 開關鈕在遊戲卡上、彈窗本體掛在頁面上，兩邊要看同一份

import type { Game } from '@/types/game';

const openedGame = ref<Game | null>(null);

export function useGameDetail() {
    // Functions
    function closeGameDetail() {
        openedGame.value = null;
    }

    function openGameDetail(game: Game) {
        openedGame.value = game;
    }

    return {
        closeGameDetail,
        openedGame,
        openGameDetail,
    };
}
