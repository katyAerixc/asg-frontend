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
                    :aria-selected="activeTab === tab"
                    class="support__tab"
                    :class="{ 'support__tab--active': activeTab === tab }"
                    role="tab"
                    type="button"
                    @click="switchTab(tab)"
                >
                    <!-- 文字獨立包一層：底線只跟著文字寬度，不要把紅點也算進去 -->
                    <span
                        class="support__tab-label"
                        :class="{ 'support__tab-label--active': activeTab === tab }"
                    >
                        {{ $t(`support.tab.${tab}`) }}

                        <!-- 有客服回覆還沒看就亮紅點。掛在文字裡面用絕對定位，不佔版面 -->
                        <span
                            v-if="tab === 'history' && hasUnreadReply"
                            class="support__dot"
                        />
                    </span>
                </button>
            </div>

            <!-- 點開某一筆時，紀錄列表換成那一筆的內容 -->
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
const {
    activeTab,
    hasUnreadReply,
    openedRecord,
} = storeToRefs(supportStore);
const { close: closeSupport, switchTab } = supportStore;
</script>

<style scoped lang="scss">
// 高度（Figma Frame 1558 客服 H5 650／Frame 1557 客服 PC 800）走 BaseModal 的 prop，
// 不能寫在這裡：BaseModal 的根節點是 Teleport，scoped CSS 傳不進去
.support {
    // 撐滿彈窗剩下的高度，裡面的列表才有地方捲動
    &__body {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-4);

        min-height: 0;
    }

    &__tabs {
        display: flex;
        flex-shrink: 0;
    }

    // Figma：Inter 20 / 300 / 行高 100%（這裡留 140%，其他語言才不會被裁到）
    // 未選中 Neutral/30、選中 Neutral/10（她 2026-09-11 給值）
    &__tab {
        cursor: pointer;

        display: flex;
        flex: 1;
        gap: 6px;
        align-items: center;
        justify-content: center;

        padding: 0 0 var(--corner-2);
        border: 0;

        font-size: 20px;
        font-weight: 300;
        line-height: 1.4;
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
            font-weight: 700;
            color: var(--color-neutral-10);
        }
    }

    // 底線只畫在文字底下，紅點不算在內（她 2026-09-11 指定）
    &__tab-label {
        position: relative;

        &--active::after {
            content: '';

            position: absolute;
            right: 0;
            bottom: -6px;
            left: 0;

            height: 2px;

            background: currentcolor;
        }
    }

    // Figma Ellipse 3：10 x 10。
    // 🚨 用絕對定位掛在文字右邊，不佔版面空間——
    //    如果讓它排在文字旁邊，紅點消失時整個 tab 的字會往回跳一下（她 2026-09-11 抓到）
    &__dot {
        position: absolute;
        top: 50%;
        left: calc(100% + 6px);
        transform: translateY(-50%);

        width: 10px;
        height: 10px;
        border-radius: var(--corner-full);

        background: var(--color-red-20);
    }
}
</style>
