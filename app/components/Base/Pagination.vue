<template>
    <nav
        ref="nav"
        :aria-label="$t('common.pagination')"
        class="base-pagination"
    >
        <button
            :aria-label="$t('common.prevPage')"
            class="base-pagination__arrow"
            :disabled="modelValue <= 1"
            type="button"
            @click="go(modelValue - 1)"
        >
            <span class="base-pagination__arrow-icon base-pagination__arrow-icon--prev i-sp-arrow-right" />
        </button>

        <ul
            ref="list"
            class="base-pagination__list"
        >
            <li
                v-for="(item, index) in items"
                :key="index"
            >
                <span
                    v-if="item === GAP"
                    class="base-pagination__gap"
                >…</span>

                <button
                    v-else
                    :aria-current="item === modelValue ? 'page' : undefined"
                    class="base-pagination__page"
                    :class="{ 'base-pagination__page--active': item === modelValue }"
                    type="button"
                    @click="go(item)"
                >
                    {{ item }}
                </button>
            </li>
        </ul>

        <button
            :aria-label="$t('common.nextPage')"
            class="base-pagination__arrow"
            :disabled="modelValue >= total"
            type="button"
            @click="go(modelValue + 1)"
        >
            <span class="base-pagination__arrow-icon i-sp-arrow-right" />
        </button>
    </nav>
</template>

<script setup lang="ts">
// Define props, models and emits
const props = defineProps<{ total: number }>();

const modelValue = defineModel<number>({ default: 1 });

// Variables
// 省略號的代號。用字串當標記，跟真的頁碼（數字）分得開
const GAP = '…';

// 一排放不下 7 格時（320～375 的彈窗裡）改成 5 格，不用橫向捲軸（她 2026-09-17 選）
const isCompact = ref<boolean>(false);
const listRef = useTemplateRef<HTMLUListElement>('list');
const navRef = useTemplateRef<HTMLElement>('nav');

// Computed properties
// 寬度夠：固定 7 格，寬度才不會隨著頁數變來變去（設計稿 12 頁時是 1 2 3 … 10 11 12）
// 寬度不夠：固定 5 格（頭尾 1 2 3 … 12、中間 1 … 5 … 12）
const items = computed<(number | typeof GAP)[]>(() => {
    const { total } = props;
    const current = modelValue.value;
    const slots = isCompact.value ? 5 : 7;

    if (total <= slots) return Array.from({ length: total }, (_, index) => index + 1);

    if (isCompact.value) {
        if (current <= 2) {
            return [
                1,
                2,
                3,
                GAP,
                total,
            ];
        }

        if (current >= total - 1) {
            return [
                1,
                GAP,
                total - 2,
                total - 1,
                total,
            ];
        }

        return [
            1,
            GAP,
            current,
            GAP,
            total,
        ];
    }

    // 頭尾附近：照設計稿長相，前三顆 + 後三顆
    if (current <= 3 || current >= total - 2) {
        return [
            1,
            2,
            3,
            GAP,
            total - 2,
            total - 1,
            total,
        ];
    }

    // 中間：只留第一頁、目前頁前後各一顆、最後一頁
    return [
        1,
        GAP,
        current - 1,
        current,
        current + 1,
        GAP,
        total,
    ];
});

// Functions
function go(page: number) {
    if (page < 1 || page > props.total || page === modelValue.value) return;

    modelValue.value = page;
}

// 用畫面上真的尺寸算「7 格要多寬」，手機 30、電腦 34 都不用在這裡寫死
// 不管現在畫的是 5 格還是 7 格，算出來都一樣，所以切換後不會來回跳
function updateCompact() {
    const nav = navRef.value;
    const list = listRef.value;
    const slot = list?.firstElementChild as HTMLElement | null | undefined;
    if (!nav || !list || !slot) return;

    const count = list.children.length;
    const slotWidth = slot.offsetWidth;
    const listGap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
    const navGap = Number.parseFloat(getComputedStyle(nav).columnGap) || 0;
    const arrowsWidth = [...nav.children]
        .filter((element) => element !== list)
        .reduce((sum, element) => sum + (element as HTMLElement).offsetWidth, 0);
    const listExtra = list.offsetWidth - (count * slotWidth + (count - 1) * listGap);
    const fullWidth = arrowsWidth + 2 * navGap + listExtra + 7 * slotWidth + 6 * listGap;

    isCompact.value = fullWidth > nav.clientWidth;
}

// Hooks
useResizeObserver(navRef, updateCompact);
</script>

<style scoped lang="scss">
// Figma Frame 1558：圓框只包數字與省略號，左右箭頭放在框外（她 2026-09-11 指定）
.base-pagination {
    display: flex;
    gap: var(--corner-2);
    align-items: center;
    justify-content: space-between;

    width: 100%;

    // Figma PC/Pagination arrow（她 2026-09-14 給三個狀態）：
    // 預設 底 Primary/20 的 20%、沒框；hover 多一圈 Primary/60 框；選取（按下去）底 Primary/20 的 30% + 框 Primary/60
    &__arrow {
        cursor: pointer;

        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;

        width: 30px;
        height: 30px;
        padding: 0;
        border: 1px solid transparent; // 平常看不到，滑鼠移上去、按下去才上色；寬度一直在，按鈕不會跳
        border-radius: var(--corner-full);

        background: var(--color-primary-opacity-20-20);

        // 鍵盤操作時的焦點框：瀏覽器預設是灰色方框，換成設計裡的藍
        &:focus-visible {
            outline: 2px solid var(--color-primary-60);
            outline-offset: 2px;
        }

        // 選取：按下去的那一下
        &:active:not(:disabled) {
            border-color: var(--color-primary-60);
            background: var(--color-primary-opacity-20-30);
        }

        // 走到頭就不能再按：箭頭轉灰，底下的圓也拿掉
        &:disabled {
            cursor: not-allowed;
            background: transparent;
        }

        // hover：多一圈外框（她 2026-09-14 指定），底色不變
        @media (hover: hover) {
            &:hover:not(:disabled) {
                border-color: var(--color-primary-60);
            }
        }
    }

    // 用跟選單列同一支箭頭（arrow-right），往左那顆轉 180 度
    // UnoCSS 的圖示是遮罩，尺寸要用 mask-size，background-size 對遮罩沒作用
    // Figma icon/arrow：手機 20、電腦 24
    &__arrow-icon {
        width: 20px;
        height: 20px;
        color: var(--color-primary-60);
        background-color: currentcolor;

        &--prev {
            transform: rotate(180deg);
        }

        :disabled & {
            color: var(--color-neutral-60);
        }
    }

    // 這一圈才是 Figma 的框：只框住數字
    &__list {
        display: flex;
        gap: var(--corner-1);
        align-items: center;
        justify-content: center;

        height: 38px;
        margin: 0;
        padding: var(--corner-1) 3px;
        border: 1px solid var(--color-neutral-40);
        border-radius: var(--corner-full);

        list-style: none;
    }

    // Figma：30 x 30 圓形。未選中沒有底色，文字 16 / 400 / Neutral/40
    &__page {
        cursor: pointer;

        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;

        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;
        border-radius: var(--corner-full);

        font-size: var(--font-size-16);
        font-weight: 400;
        color: var(--color-neutral-40);

        background: transparent;

        transition: background-color 0.2s;

        &:focus-visible {
            outline: 2px solid var(--color-primary-60);
            outline-offset: 2px;
        }

        // 選取（目前這一頁）：底色 Primary/60、文字 Neutral/10 且加粗到 600
        &--active {
            font-weight: 600;
            color: var(--color-neutral-10);
            background: var(--color-primary-60);
        }

        // hover：底色 Primary/20 的 20%，文字維持 Neutral/40（Figma PC/Pagination，她 2026-09-14 給）
        @media (hover: hover) {
            &:hover:not(&--active) {
                background: var(--color-primary-opacity-20-20);
            }
        }
    }

    // 省略號跟未選中的數字同一套字，只是不能點
    &__gap {
        display: flex;
        align-items: center;
        justify-content: center;

        width: 30px;
        height: 30px;

        font-size: var(--font-size-16);
        font-weight: 400;
        color: var(--color-neutral-40);
    }

    // 電腦版：Figma PC/Pagination 每顆 34 × 34（手機 MB/Pagination 是 30）
    @media (width >= 600px) {
        &__arrow,
        &__page,
        &__gap {
            width: 34px;
            height: 34px;
        }

        &__arrow-icon {
            width: 24px;
            height: 24px;
        }

        // Figma PC/Pagination：數字 18（手機 16）
        &__page,
        &__gap {
            font-size: var(--font-size-18);
        }

        &__list {
            gap: var(--corner-2);
            height: 42px; // 34 ＋ 上下內距各 4
        }
    }
}
</style>
