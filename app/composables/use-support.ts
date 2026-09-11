// 客服中心：問題類型清單、彈窗開關
// 之後接 API 只要改這一支

export interface IssueType {
    labelKey: string; // 翻譯 key，顯示時用 t(labelKey)
    value: string;
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

// 描述字數上限、附件限制（她 2026-09-10 指定：JPG / JPEG / PNG，15MB 以內）
export const DESCRIPTION_MAX_LENGTH = 500;
export const ATTACHMENT_ACCEPT = 'image/jpeg,image/png';
export const ATTACHMENT_MAX_BYTES = 15 * 1024 * 1024;

// 彈窗開關：開關鈕在選單裡，彈窗本體掛在 Header 上，兩邊要看同一份
const isSupportOpen = ref(false);

// 「提問紀錄」旁的紅點：有客服回覆還沒看就亮。先寫死，之後接 API
const hasUnreadReply = ref(true);

export function useSupport() {
    // Functions
    function closeSupport() {
        isSupportOpen.value = false;
    }

    function openSupport() {
        isSupportOpen.value = true;
    }

    return {
        closeSupport,
        hasUnreadReply,
        isSupportOpen,
        openSupport,
    };
}
