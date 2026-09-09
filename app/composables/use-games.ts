import IMG from '@/assets/images/game/products.png';
import type { Game } from '@/types/game';

/**
 * 遊戲清單資料層
 *
 * 目前回傳假資料；之後接後端時只要改這一支檔案，
 * 頁面與組件都不用動（它們只認 Game 這個格式）。
 *
 * 接 API 時的改法大致是：
 *   const { data, pending, error } = await useFetch<Game[]>('/api/games');
 * 然後把下面的假資料換掉，pending / error 直接往外拋。
 */

const DESC = 'game info game info game info game info';

const MOCK_GAMES: Game[] = [
    {
        description: DESC,
        id: 1,
        image: IMG,
        maxMultiplier: 'x10000',
        name: 'Game1',
        rtp: '96.05%',
        rtpTrend: 'up',
        tags: ['NEW'],
        volatility: '高',
    },
    {
        description: DESC,
        id: 2,
        image: IMG,
        maxMultiplier: 'x10000',
        name: 'Game1',
        rtp: '96.05%',
        rtpTrend: 'down',
        tags: [
            'NEW',
            'HOT',
        ],
        volatility: '高',
    },
    {
        description: DESC,
        id: 3,
        image: IMG,
        maxMultiplier: 'x10000',
        name: 'Game1',
        rtp: '96.05%',
        rtpTrend: null,
        tags: ['NEW'],
        volatility: '高',
    },
    {
        description: DESC,
        id: 4,
        image: IMG,
        maxMultiplier: 'x10000',
        name: 'Game1',
        rtp: '96.05%',
        rtpTrend: null,
        tags: [],
        volatility: '高',
    },
    {
        description: DESC,
        id: 5,
        image: IMG,
        maxMultiplier: 'x10000',
        name: 'Game1',
        rtp: '96.05%',
        rtpTrend: null,
        tags: ['HIGH'],
        volatility: '高',
    },
    {
        description: DESC,
        id: 6,
        image: IMG,
        maxMultiplier: 'x10000',
        name: 'Game1',
        rtp: '96.05%',
        rtpTrend: null,
        tags: [],
        volatility: '高',
    },
];

export function useGames() {
    const games = ref<Game[]>(MOCK_GAMES);

    // 接 API 後這兩個會由 useFetch 提供，畫面就能顯示載入中／錯誤狀態
    const pending = ref(false);
    const error = ref<Error | null>(null);

    return {
        error,
        games,
        pending,
    };
}
