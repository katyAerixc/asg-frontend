// 客服中心：提問紀錄、目前分頁、開著的那一筆、彈窗開關
// 開關鈕在選單裡、彈窗本體掛在 Header 上，兩邊要看同一份（為什麼用 store：見 ADR 0003）
//
// 型別在 types/support.ts、常數與純函式在 libs/support.ts，這裡只放會變的。假資料暫時也在這裡，接 API（libs/api/）後整段換成 useFetch。

import { RECORDS_PER_PAGE } from '@/libs/support';
import type {
    SupportRecord,
    SupportReply,
    SupportTab,
} from '@/types/support';

// 假資料：70 筆剛好湊滿 12 頁，跟設計稿的分頁長相一致
// ⚠️ 內容是佔位用的，接 API 後整段刪掉換成 useFetch
const MOCK_REPLY: SupportReply = {
    content: [
        '目前已幫您查詢，我們已將您的帳號與異常狀況提交給技術部門（與遊戲服務商）進行深度核對。',
        '處理期間，請先不要反覆嘗試登入該款遊戲，以免影響數據同步。一有最新進度，我們將第一時間在此回覆您。造成您的不便，敬請見諒。',
    ].join('\n'),
    repliedAt: '2026/10/10 15:51:55',
};

function createMockRecords(): SupportRecord[] {
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

export const useSupportStore = defineStore('support', () => {
    // State
    // 用函式每次產生新的一份：假資料會被「標記已讀」改到，不能所有請求共用同一個陣列
    const records = ref<SupportRecord[]>(createMockRecords());
    const isOpen = ref(false);
    const activeTab = ref<SupportTab>('form');
    const currentPage = ref(1);
    const openedRecordId = ref<null | number>(null);

    // Getters
    const totalPages = computed(() => Math.ceil(records.value.length / RECORDS_PER_PAGE));

    const pagedRecords = computed(() => {
        const start = (currentPage.value - 1) * RECORDS_PER_PAGE;

        return records.value.slice(start, start + RECORDS_PER_PAGE);
    });

    // 沒點開任何一筆時是 null，畫面就顯示列表
    const openedRecord = computed(() => records.value.find((item) => item.id === openedRecordId.value) ?? null);

    // 「提問紀錄」旁的紅點：只要還有「客服回覆過但沒看」的就亮。
    // 一筆紀錄都沒有時 some() 回 false，紅點自然不會出現（她 2026-09-11 指定）
    const hasUnreadReply = computed(() => records.value.some((item) => item.status === 'replied' && !item.isReplyRead));

    // Actions
    function close() {
        isOpen.value = false;
    }

    // 從單筆內容退回列表
    function closeRecord() {
        openedRecordId.value = null;
    }

    // 每次重新打開都回到「提交問題」第一頁，跟關掉前停在哪無關。
    // 分頁一定要歸位：接 API 後筆數變少時，停在舊頁碼會看到空白列表而且退不回去
    function open() {
        activeTab.value = 'form';
        currentPage.value = 1;
        openedRecordId.value = null;
        isOpen.value = true;
    }

    // 點開就當作看過了，紅點跟著滅（之後接 API 時這裡要順便打「已讀」）
    function openRecord(id: number) {
        const record = records.value.find((item) => item.id === id);

        if (record) record.isReplyRead = true;
        openedRecordId.value = id;
    }

    // 換分頁 tab 時把展開的那筆收起來，不然切回來會停在舊畫面
    function switchTab(tab: SupportTab) {
        activeTab.value = tab;
        openedRecordId.value = null;
    }

    return {
        activeTab,
        close,
        closeRecord,
        currentPage,
        hasUnreadReply,
        isOpen,
        open,
        openedRecord,
        openRecord,
        pagedRecords,
        switchTab,
        totalPages,
    };
});
