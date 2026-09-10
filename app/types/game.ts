// 遊戲類型：對應分類列的按鈕（「全部」不是類型，是「不篩選」）
export type GameCategory = '小遊戲' | '棋牌' | '老虎機' | '魚機';

// 遊戲卡片的資料格式（欄位定義見 katy-designs/CONTEXT.md「遊戲卡片」）
export interface Game {
    category: GameCategory; // 分類列用這個篩選
    description: string;
    id: number;
    image: string;
    maxMultiplier: string; // 最高賠率 e.g. 'x10000'
    name: string;
    rtp: string; // e.g. '96.05%'
    rtpTrend: 'down' | 'up' | null; // 紅＝漲 up、綠＝跌 down
    tags: string[]; // NEW / HOT / HIGH，可多個
    volatility: string; // 波動度：高 / 中 / 低
}
