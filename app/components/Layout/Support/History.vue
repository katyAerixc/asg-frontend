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

                            <!-- 用 visibility 藏而不是移除：位子留著，已讀後標籤才不會縮一下 -->
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
    gap: var(--corner-5);

    min-height: 0;

    &__list {
        overflow-y: auto;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-2);

        min-height: 0;
        margin: 0;
        padding: 0 var(--corner-2);

        list-style: none;
    }

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

        // 按下去（手機電腦都有）
        &:active {
            background: var(--bg-support-card-active);
        }

        // hover 排除按住的時候，不然寫在後面的 hover 會蓋掉按下去的顏色
        @media (hover: hover) {
            &:hover:not(:active) {
                background: var(--bg-support-card-hover);
            }
        }
    }

    &__head {
        display: flex;
        gap: var(--corner-3);
        align-items: center;
        justify-content: space-between;
    }

    // 內容頁的日期是 Primary/40，跟列表刻意不同
    &__date {
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-50);
    }

    &__status {
        display: flex;
        flex-shrink: 0;
        gap: var(--corner-1);
        align-items: center;

        height: 27px;
        padding: var(--corner-1) var(--corner-2);
        border-radius: var(--corner-full);

        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);

        // 已回覆：藍底白字
        &--replied {
            font-weight: var(--font-weight-medium);
            color: var(--color-neutral-10);
            background: var(--color-primary-50);
        }

        // 已完結：手機與電腦底色不同，電腦見下方 media
        &--closed {
            color: var(--color-neutral-80);
            background: var(--bg-support-status-closed);
        }
    }

    &__dot {
        width: 10px;
        height: 10px;
        border-radius: var(--corner-full);
        background: var(--color-semantic-red-20);

        // 已讀：藏起來但位子留著，標籤寬度不變（不然會抖一下）
        &--read {
            visibility: hidden;
        }
    }

    &__summary {
        display: flex;
        gap: var(--corner-1);
        align-items: baseline;

        min-width: 0;

        font-size: var(--font-size-18);
        font-weight: var(--font-weight-regular);
    }

    // 類型後面的分隔：Figma 是全形字「｜」接在類型後面（同字級同顏色），不是框線
    &__type {
        flex-shrink: 0;
        font-weight: var(--font-weight-medium);
        color: var(--color-neutral-10);

        &::after {
            content: '｜';
        }
    }

    // 一行放不下就切掉補「...」
    &__text {
        // 「…」要裁左右；上下不裁，聲調、泰文上下標才不會被切
        overflow: clip visible;

        // clip 不像 hidden 會讓它自動縮得比字窄，要自己寫 0，「…」才出得來
        min-width: 0;

        color: var(--color-neutral-20);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__pagination {
        flex-shrink: 0;
    }

    @media (width >= 600px) {
        &__date {
            font-size: var(--font-size-16);
        }

        &__status {
            font-size: var(--font-size-16);

            &--closed {
                background: var(--color-shadow-light-50);
            }
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
