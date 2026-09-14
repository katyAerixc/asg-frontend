// 客服中心的型別（跨檔案共用，所以放 types/；公司規範第五章）

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
