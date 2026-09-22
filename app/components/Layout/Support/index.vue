<template>
    <BaseModal
        height="650px"
        height-pc="800px"
        :title="$t('support.title')"
        @close="closeSupport"
    >
        <div class="support__body">
            <div
                class="support__tabs"
                role="tablist"
            >
                <button
                    v-for="tab in TABS"
                    :key="tab"
                    class="support__tab"
                    :class="{ 'support__tab--active': activeTab === tab }"
                    role="tab"
                    type="button"
                    :aria-selected="activeTab === tab"
                    @click="switchTab(tab)"
                >
                    <span
                        class="support__tab-label"
                        :class="{ 'support__tab-label--active': activeTab === tab }"
                    >
                        {{ $t(`support.tab.${tab}`) }}

                        <span
                            v-if="tab === 'history' && hasUnreadReply"
                            class="support__dot"
                        />
                    </span>
                </button>
            </div>

            <LayoutSupportForm v-if="activeTab === 'form'" />
            <LayoutSupportDetail
                v-else-if="openedRecord"
                :record="openedRecord"
            />
            <LayoutSupportHistory v-else />
        </div>
    </BaseModal>
</template>

<script setup lang="ts">
import type { SupportTab } from '@/types/support';

// Variables
const TABS: SupportTab[] = [
    'form',
    'history',
];

const supportStore = useSupportStore();
const { activeTab } = storeToRefs(supportStore);
const { close: closeSupport, switchTab } = supportStore;

// 紀錄是後端資料，從 useAsyncData 來；紅點與開著的那筆都由它算
const { hasUnreadReply, openedRecord } = useSupportRecords();
</script>

<style scoped lang="scss">
// 高度走 BaseModal 的 prop，
// 不能寫在這裡：BaseModal 的根節點是 Teleport，scoped CSS 傳不進去
.support {
    // 撐滿彈窗剩下的高度，裡面的列表才有地方捲動
    &__body {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-5);

        min-height: 0;
    }

    &__tabs {
        display: flex;
        flex-shrink: 0;
    }

    &__tab {
        cursor: pointer;

        // 底線用絕對定位貼在底部，這裡當它的定位基準
        position: relative;

        display: flex;
        flex: 1;
        gap: 6px;
        align-items: center;
        justify-content: center;

        height: 44px;

        // 底線貼在最底部
        padding: var(--corner-2) 0;
        border: 0;

        font-size: var(--size-large-font-size);
        font-weight: var(--font-weight-regular);
        color: var(--color-neutral-30);

        background: transparent;

        transition: color 0.2s;

        // 鍵盤操作時的焦點框：瀏覽器預設是灰色方框，換成設計裡的藍
        &:focus-visible {
            outline: 2px solid var(--color-primary-60);
            outline-offset: 2px;
        }

        // 選中：轉白 + 粗體，底線也是同一個色（底線用 currentcolor 跟著走）
        &--active {
            font-weight: var(--font-weight-bold);
            color: var(--color-neutral-10);
        }

        // 底線固定寬、置中、貼齊頁籤底部
        // 固定寬度的好處：切成越南文「Gửi câu hỏi」底線不會跟著變長
        // 顏色寫死 Neutral/10，不用 currentcolor——未選中的字是 Neutral/30，
        // 用 currentcolor 以後若加上 hover 變色，底線會跟著變
        &--active::after {
            content: '';

            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);

            width: 50px;
            height: 1px;
            border-radius: var(--corner-full);

            background: var(--color-neutral-10);
        }
    }

    &__tab-label {
        position: relative;
    }

    // 🚨 如果讓它排在文字旁邊，紅點消失時整個 tab 的字會往回跳一下
    &__dot {
        position: absolute;
        top: 50%;
        left: calc(100% + var(--corner-2));
        transform: translateY(-50%);

        width: 10px;
        height: 10px;
        border-radius: var(--corner-full);

        background: var(--color-semantic-red-20);
    }

    @media (width >= 600px) {
        &__tab {
            height: 47px;
            padding-inline: var(--corner-3);
        }

        &__tab--active::after {
            height: 2px;
        }

        &__dot {
            width: 12px;
            height: 12px;
        }
    }
}
</style>
