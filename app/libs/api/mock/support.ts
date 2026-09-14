// 客服假資料：70 筆剛好湊滿 12 頁，跟設計稿的分頁長相一致
// ⚠️ 內容是佔位用的，接 API 後整個 mock/ 資料夾刪掉

import type {
    SupportRecord,
    SupportReply,
} from '@/types/support';

const MOCK_REPLY: SupportReply = {
    content: [
        '目前已幫您查詢，我們已將您的帳號與異常狀況提交給技術部門（與遊戲服務商）進行深度核對。',
        '處理期間，請先不要反覆嘗試登入該款遊戲，以免影響數據同步。一有最新進度，我們將第一時間在此回覆您。造成您的不便，敬請見諒。',
    ].join('\n'),
    repliedAt: '2026/10/10 15:51:55',
};

// 用函式每次產生新的一份：假資料會被「標記已讀」改到，不能所有請求共用同一個陣列
export function createMockRecords(): SupportRecord[] {
    return Array.from({ length: 70 }, (_, index) => ({
        createdAt: '2026/10/10',
        description: '尚有餘額但無法進入遊戲，已嘗試多次皆未看到有更新餘額...',
        id: index + 1,
        // 第一筆還沒看，所以紅點會亮；其餘都看過了
        isReplyRead: index !== 0,
        issueTypeKey: 'support.issueType.billing',
        reply: MOCK_REPLY,
        // 第一筆是「客服已回覆」，其餘已完結
        status: index === 0 ? 'replied' : 'closed',
    }));
}
