// 遊戲類型：id 一律用英文，顯示名走 i18n（lobby.category.*）
// 中文當 id 的話，換語言就對不上了
export type GameCategory = 'card' | 'fish' | 'mini' | 'slot';

// 分類列比類型多一個「全部」——那是「不篩選」，不是一種類型
export type GameCategoryFilter = 'all' | GameCategory;

// 首頁排序：NEW 新遊戲在前、HOT 熱門在前
export type GameSort = 'HOT' | 'NEW';

// 波動度：同樣用英文 id，顯示走 i18n（lobby.volatility.*）
export type GameVolatility = 'high' | 'low' | 'mid' | 'midHigh' | 'midLow';

// 遊戲卡片的資料格式
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
    volatility: GameVolatility; // 波動度，顯示走 i18n
}
