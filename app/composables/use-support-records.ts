// 客服紀錄（後端資料）：用 useAsyncData 抓，不塞進 store（ADR 0003）
// 分頁、開著哪筆、紅點都從這份資料算；「停在第幾頁、開著哪筆、看過哪幾筆」這些 UI 狀態在 stores/support.ts

import {
    fetchSupportRecords,
    markSupportReplyRead,
} from '@/libs/api/support';
import { RECORDS_PER_PAGE } from '@/libs/support';

export function useSupportRecords() {
    const supportStore = useSupportStore();

    // 同一個 key 在多個組件呼叫會共用同一份，不會重抓
    const {
        data,
        error,
        refresh,
        status,
    } = useAsyncData('support-records', () => fetchSupportRecords(), { default: () => [] });

    // Computed properties
    const pending = computed(() => status.value === 'pending');

    // 後端資料疊上「這次開站看過的」：彈窗關掉再開，Nuxt 會把資料清掉重抓，
    // 假資料又是第一筆未讀；靠 store 的 readIds 蓋回去，紅點才不會又亮（2026-09-14 實測踩到）
    // 點開「客服已回覆」那一筆 → 看過就算完結，標籤改成「已完結」（她 2026-09-14 指定）
    const records = computed(() => data.value.map((item) =>
        supportStore.readIds.includes(item.id)
            ? {
                ...item,
                isReplyRead: true,
                status: 'closed' as const,
            }
            : item,
    ));

    const totalPages = computed(() => Math.ceil(records.value.length / RECORDS_PER_PAGE));

    const pagedRecords = computed(() => {
        const start = (supportStore.currentPage - 1) * RECORDS_PER_PAGE;

        return records.value.slice(start, start + RECORDS_PER_PAGE);
    });

    // 沒點開任何一筆時是 null，畫面就顯示列表
    const openedRecord = computed(() => records.value.find((item) => item.id === supportStore.openedRecordId) ?? null);

    // 「提問紀錄」旁的紅點：只要還有「客服回覆過但沒看」的就亮。
    // 一筆紀錄都沒有時 some() 回 false，紅點自然不會出現（她 2026-09-11 指定）
    const hasUnreadReply = computed(() => records.value.some((item) => item.status === 'replied' && !item.isReplyRead));

    // Functions
    // 點開就當作看過了：先記在 store（紅點立刻滅），再通知後端
    async function markRead(id: number) {
        const record = records.value.find((item) => item.id === id);

        if (!record || record.isReplyRead) return;

        supportStore.markRead(id);
        await markSupportReplyRead(id);
    }

    return {
        error,
        hasUnreadReply,
        markRead,
        openedRecord,
        pagedRecords,
        pending,
        records,
        refresh,
        totalPages,
    };
}
