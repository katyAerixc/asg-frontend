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
                    <!-- 文字獨立包一層：給紅點當定位基準 -->
                    <span
                        class="support__tab-label"
                        :class="{ 'support__tab-label--active': activeTab === tab }"
                    >
                        {{ $t(`support.tab.${tab}`) }}

                        <!-- 紅點用絕對定位，不佔版面，出現或消失時頁籤不會跳 -->
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
// 高度（Figma Frame 1558 客服 H5 650／Frame 1557 客服 PC 800）走 BaseModal 的 prop，
// 不能寫在這裡：BaseModal 的根節點是 Teleport，scoped CSS 傳不進去
.support {
    // 撐滿彈窗剩下的高度，裡面的列表才有地方捲動
    &__body {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-5); // Figma Frame 11363：頁籤 → 表單 30

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

        // 底線用絕對定位貼在底部，這裡當它的定位基準
        position: relative;

        display: flex;
        flex: 1;
        gap: 6px;
        align-items: center;
        justify-content: center;

        height: 44px; // Figma MB 頁籤 44、PC 47

        // Figma：上下各留 10（文字區 = 手機 24、電腦 27），底線貼在最底部
        padding: var(--corner-2) 0;
        border: 0;

        // Figma UI kit 的 Large 字級（手機 20／電腦 22）；頁籤文字樣式是 22/22p
        font-size: var(--size-large-font-size);
        font-weight: var(--font-weight-regular);
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
            font-weight: var(--font-weight-bold);
            color: var(--color-neutral-10);
        }

        // Figma Rectangle 611：底線固定 50 寬、置中、貼齊頁籤底部（手機 1px、電腦 2px）
        // 固定寬度的好處：切成越南文「Gửi câu hỏi」底線不會跟著變長
        // 顏色照 Figma 的顏色樣式 Neutral/10 寫死，不用 currentcolor——未選中的字是 Neutral/30，
        // 用 currentcolor 以後若加上 hover 變色，底線會跟著變，跟設計稿不合
        &--active::after {
            content: '';

            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);

            width: 50px;
            height: 1px;
            border-radius: var(--corner-full); // Figma Rectangle 611：radius 100

            background: var(--color-neutral-10);
        }
    }

    // 只為了給紅點當定位基準（底線 2026-09-16 改成固定 50 寬，掛在 &__tab 上）
    &__tab-label {
        position: relative;
    }

    // Figma Ellipse 3：10 x 10。
    // 🚨 用絕對定位掛在文字右邊，不佔版面空間——
    //    如果讓它排在文字旁邊，紅點消失時整個 tab 的字會往回跳一下（她 2026-09-11 抓到）
    &__dot {
        position: absolute;
        top: 50%;
        left: calc(100% + var(--corner-2)); // Figma Frame 3 的 gap 10
        transform: translateY(-50%);

        width: 10px;
        height: 10px;
        border-radius: var(--corner-full);

        background: var(--color-semantic-red-20);
    }

    @media (width >= 600px) {
        // Figma PC/Tab：左右內距 Corner-3（手機 MB 頁籤是 0）
        &__tab {
            height: 47px;
            padding-inline: var(--corner-3);
        }

        &__tab--active::after {
            height: 2px; // Figma PC 底線 2px（手機 1px）
        }

        // Figma PC Ellipse 3：12 x 12
        &__dot {
            width: 12px;
            height: 12px;
        }
    }
}
</style>
