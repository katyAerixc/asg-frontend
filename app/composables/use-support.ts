// 客服中心：問題類型清單、提問紀錄、彈窗開關
// 之後接 API 只要改這一支

export type SupportStatus = 'closed' | 'replied';
export type SupportTab = 'form' | 'history';

export interface IssueType {
    labelKey: string; // 翻譯 key，顯示時用 t(labelKey)
    value: string;
}

export interface SupportRecord {
    createdAt: string;
    // 使用者自己打的內容，不走 i18n（真資料之後由 API 給）
    description: string;
    id: number;
    // 客服回覆看過了沒。決定紅點要不要亮，點開那一筆就轉成 true
    isReplyRead: boolean;
    issueTypeKey: string;
    reply: null | SupportReply;
    status: SupportStatus;
}

export interface SupportReply {
    content: string;
    repliedAt: string;
}

// 問題類型（Figma 下拉選單的六個選項，順序照設計稿）
// 這裡存翻譯 key 不存文字：資料層不該綁死語言
export const ISSUE_TYPES: IssueType[] = [
    {
        labelKey: 'support.issueType.billing',
        value: 'billing',
    },
    {
        labelKey: 'support.issueType.gameError',
        value: 'game-error',
    },
    {
        labelKey: 'support.issueType.account',
        value: 'account',
    },
    {
        labelKey: 'support.issueType.gameInfo',
        value: 'game-info',
    },
    {
        labelKey: 'support.issueType.feedback',
        value: 'feedback',
    },
    {
        labelKey: 'support.issueType.other',
        value: 'other',
    },
];

// 卡片與單筆內容只顯示短標籤（「帳務問題」），下拉選單才顯示完整說明。
// 🚨 不要拿翻譯後的文字去切分隔符號——中日韓用全形「｜」，英泰越用半形「-」，
//    切不到就會把整句說明塞進卡片（2026-09-14 修）。key 是我們自己的，換算才穩。
export function toShortIssueKey(labelKey: string) {
    return labelKey.replace('.issueType.', '.issueTypeShort.');
}

// 描述字數上限、附件限制（她 2026-09-10 指定：JPG / JPEG / PNG，15MB 以內）
export const DESCRIPTION_MAX_LENGTH = 500;
export const ATTACHMENT_ACCEPT = 'image/jpeg,image/png';
export const ATTACHMENT_MAX_BYTES = 15 * 1024 * 1024;

// 一頁幾筆。設計稿 PC 一頁 6 筆、共 12 頁
export const RECORDS_PER_PAGE = 6;

// 假資料：70 筆剛好湊滿 12 頁，跟設計稿的分頁長相一致
// ⚠️ 內容是佔位用的，接 API 後整段刪掉換成 useFetch
const MOCK_REPLY: SupportReply = {
    content: [
        '目前已幫您查詢，我們已將您的帳號與異常狀況提交給技術部門（與遊戲服務商）進行深度核對。',
        '處理期間，請先不要反覆嘗試登入該款遊戲，以免影響數據同步。一有最新進度，我們將第一時間在此回覆您。造成您的不便，敬請見諒。',
    ].join('\n'),
    repliedAt: '2026/10/10 15:51:55',
};

const MOCK_RECORDS: SupportRecord[] = Array.from({ length: 70 }, (_, index) => ({
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

// 放在模組層級：開關鈕在選單裡、彈窗本體掛在 Header 上，兩邊要看同一份
// 用 ref 包起來才有反應性——點開某一筆要能讓紅點跟著滅掉
const records = ref<SupportRecord[]>(MOCK_RECORDS);
const isSupportOpen = ref(false);
const activeTab = ref<SupportTab>('form');
const currentPage = ref(1);
const openedRecordId = ref<null | number>(null);

export function useSupport() {
    // Computed properties
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

    // Functions
    function closeSupport() {
        isSupportOpen.value = false;
    }

    // 從單筆內容退回列表
    function closeRecord() {
        openedRecordId.value = null;
    }

    // 點開就當作看過了，紅點跟著滅（之後接 API 時這裡要順便打「已讀」）
    function openRecord(id: number) {
        const record = records.value.find((item) => item.id === id);

        if (record) record.isReplyRead = true;
        openedRecordId.value = id;
    }

    // 每次重新打開都回到「提交問題」第一頁，跟關掉前停在哪無關。
    // 分頁一定要歸位：接 API 後筆數變少時，停在舊頁碼會看到空白列表而且退不回去
    function openSupport() {
        activeTab.value = 'form';
        currentPage.value = 1;
        openedRecordId.value = null;
        isSupportOpen.value = true;
    }

    // 換分頁 tab 時把展開的那筆收起來，不然切回來會停在舊畫面
    function switchTab(tab: SupportTab) {
        activeTab.value = tab;
        openedRecordId.value = null;
    }

    return {
        activeTab,
        closeRecord,
        closeSupport,
        currentPage,
        hasUnreadReply,
        isSupportOpen,
        openedRecord,
        openRecord,
        openSupport,
        pagedRecords,
        switchTab,
        totalPages,
    };
}
