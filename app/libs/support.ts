// 客服中心的常數與純函式（綁定客服功能，所以放 libs/ 不放 utils/；公司規範第五章）
// ⚠️ libs/ 不會自動匯入，用的地方要自己 import

import type { IssueType } from '@/types/support';

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
