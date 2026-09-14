// 客服中心的 UI 狀態：彈窗開關、分頁 tab、頁碼、開著哪一筆
// 開關鈕在選單裡、彈窗本體掛在 Header 上，兩邊要看同一份（為什麼用 store：見 ADR 0003）
//
// 紀錄本身是後端資料，在 composables/use-support-records.ts 用 useAsyncData 抓，不放這裡。
// 型別在 types/support.ts、常數與純函式在 libs/support.ts。

import type { SupportTab } from '@/types/support';

export const useSupportStore = defineStore('support', () => {
    // State
    const isOpen = ref(false);
    const activeTab = ref<SupportTab>('form');
    const currentPage = ref(1);
    const openedRecordId = ref<null | number>(null);

    // 「再次提問」帶過去的問題類型。表單拿走後就清掉，下次正常打開不會殘留
    const presetIssueType = ref<null | string>(null);

    // 這次開站已經點開過的回覆。資料重抓回來（彈窗關掉再開）也蓋得上去，紅點不會又亮
    const readIds = ref<number[]>([]);

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
        presetIssueType.value = null;
        isOpen.value = true;
    }

    // 再次提問：回到「提交問題」，並先選好這筆的問題類型（她 2026-09-14 指定）
    function askAgain(issueType: null | string) {
        presetIssueType.value = issueType;
        switchTab('form');
    }

    // 表單建立時拿一次：拿到就清掉，避免之後切回來又被選一次
    function takePresetIssueType() {
        const value = presetIssueType.value;

        presetIssueType.value = null;

        return value;
    }

    // 記住這筆看過了（後端那邊由 useSupportRecords().markRead() 通知）
    function markRead(id: number) {
        if (!readIds.value.includes(id)) {
            readIds.value = [
                ...readIds.value,
                id,
            ];
        }
    }

    function openRecord(id: number) {
        openedRecordId.value = id;
    }

    // 換分頁 tab 時把展開的那筆收起來，不然切回來會停在舊畫面
    function switchTab(tab: SupportTab) {
        activeTab.value = tab;
        openedRecordId.value = null;
    }

    return {
        activeTab,
        askAgain,
        close,
        closeRecord,
        currentPage,
        isOpen,
        markRead,
        open,
        openedRecordId,
        openRecord,
        readIds,
        switchTab,
        takePresetIssueType,
    };
});
