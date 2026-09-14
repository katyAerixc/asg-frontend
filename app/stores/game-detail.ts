// 遊戲介紹彈窗：開關與「現在看的是哪一款」
// 開關鈕在遊戲卡上、彈窗本體掛在頁面上，兩邊要看同一份（為什麼用 store：見 ADR 0003）

import type { Game } from '@/types/game';

export const useGameDetailStore = defineStore('game-detail', () => {
    // State
    // null = 沒開
    const openedGame = ref<Game | null>(null);

    // Actions
    function close() {
        openedGame.value = null;
    }

    function open(game: Game) {
        openedGame.value = game;
    }

    return {
        close,
        open,
        openedGame,
    };
});
