<template>
    <div class="support-history">
        <ul class="support-history__list">
            <li
                v-for="record in pagedRecords"
                :key="record.id"
            >
                <button
                    class="support-history__card"
                    type="button"
                    @click="openRecord(record.id)"
                >
                    <span class="support-history__head">
                        <span class="support-history__date">{{ record.createdAt }}</span>

                        <span
                            class="support-history__status"
                            :class="`support-history__status--${record.status}`"
                        >
                            {{ $t(`support.status.${record.status}`) }}

                            <!-- 紅點只在「回覆過但還沒看」時亮。用 visibility 藏起來而不是移除，
                                 位子留著，已讀後標籤才不會突然縮一下 -->
                            <span
                                v-if="record.status === 'replied'"
                                class="support-history__dot"
                                :class="{ 'support-history__dot--read': record.isReplyRead }"
                            />
                        </span>
                    </span>

                    <span class="support-history__summary">
                        <span class="support-history__type">{{ $t(toShortIssueKey(record.issueTypeKey)) }}</span>
                        <span class="support-history__text">{{ record.description }}</span>
                    </span>
                </button>
            </li>
        </ul>

        <BasePagination
            v-if="totalPages > 1"
            v-model="currentPage"
            class="support-history__pagination"
            :total="totalPages"
        />
    </div>
</template>

<script setup lang="ts">
import { toShortIssueKey } from '@/libs/support';

const supportStore = useSupportStore();
const { currentPage } = storeToRefs(supportStore);

const {
    markRead,
    pagedRecords,
    totalPages,
} = useSupportRecords();

// 點開一筆：標已讀（紅點滅）＋ 切到單筆畫面
function openRecord(id: number) {
    markRead(id);
    supportStore.openRecord(id);
}
</script>

<style scoped lang="scss">
.support-history {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--corner-3);

    min-height: 0;

    &__list {
        overflow-y: auto;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-2);

        min-height: 0;
        margin: 0;
        padding: 0;

        list-style: none;
    }

    // Figma PC/form：550 x 75、圓角 Corner-2、內距 上下 Corner-2／左右 Corner-3、間距 4
    &__card {
        cursor: pointer;

        display: flex;
        flex-direction: column;
        gap: var(--corner-1);

        width: 100%;
        padding: var(--corner-2) var(--corner-3);
        border: 0;
        border-radius: var(--corner-2);

        text-align: left;

        background: var(--bg-support-card);
        box-shadow: var(--shadow-support-card);

        transition: background-color 0.2s;

        @media (hover: hover) {
            &:hover {
                background: var(--bg-support-card-hover);
            }
        }
    }

    &__head {
        display: flex;
        gap: var(--corner-2);
        align-items: center;
        justify-content: space-between;
    }

    // Figma：Inter 14 / 300 / Primary/50（點進去的內容頁也用 50，兩邊一致，她 2026-09-14 指定）
    &__date {
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        line-height: 1.4;
        color: var(--color-primary-50);
    }

    // Figma Frame 1570（已回覆）／Frame 1571（已完結）
    &__status {
        display: flex;
        flex-shrink: 0;
        gap: var(--corner-1);
        align-items: center;

        height: 27px;
        padding: var(--corner-1) var(--corner-2);
        border-radius: var(--corner-full);

        font-size: var(--font-size-14);

        // 已回覆、已完結的字重都是 300，深淺色一樣（她 2026-09-14 指定，取代 9/11 的 500）
        font-weight: var(--font-weight-regular);

        // 已回覆：藍底白字
        &--replied {
            color: var(--color-neutral-10);
            background: var(--color-primary-50);
        }

        // 已完結：白 50% 底（淺色 #8da1e4）、深灰字
        &--closed {
            color: var(--color-neutral-80);
            background: var(--bg-support-status-closed);
        }
    }

    // Figma Ellipse 3：10 x 10
    &__dot {
        width: 10px;
        height: 10px;
        border-radius: var(--corner-full);
        background: var(--color-red-20);

        // 已讀：藏起來但位子留著，標籤寬度不變（不然會抖一下）
        &--read {
            visibility: hidden;
        }
    }

    // Figma：H5 16 / PC 18，300
    &__summary {
        display: flex;
        gap: var(--corner-2);
        align-items: baseline;

        min-width: 0;

        font-size: var(--font-size-16);
        font-weight: var(--font-weight-regular);
        line-height: 1.4;
    }

    // 類型與描述中間那條直線，用邊框畫比塞一個字元穩
    &__type {
        flex-shrink: 0;

        padding-right: var(--corner-2);
        border-right: 1px solid var(--color-white-50);

        font-weight: var(--font-weight-medium);
        color: var(--color-neutral-10);
    }

    // Figma Color/Neutral/20；一行放不下就切掉補「...」
    &__text {
        overflow: hidden;
        color: var(--color-neutral-20);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__pagination {
        flex-shrink: 0;
    }

    // PC 字級照 Figma PC（她 2026-09-14 提供淺色版 14 張 Inspect；顏色代號與深色相同）
    @media (width >= 600px) {
        &__date {
            font-size: var(--font-size-16);
        }

        &__status {
            font-size: var(--font-size-16);
        }

        &__dot {
            width: 12px;
            height: 12px;
        }

        &__summary {
            font-size: var(--font-size-20);
        }
    }
}
</style>
