<template>
    <nav class="category-filter">
        <div class="category-filter__list">
            <button
                v-for="category in CATEGORIES"
                :key="category"
                class="category-filter__tab"
                :class="{ 'category-filter__tab--active': activeCategory === category }"
                type="button"
                :data-text="$t(`lobby.category.${category}`)"
                @click="emit('update:activeCategory', category)"
            >
                <span class="category-filter__label">{{ $t(`lobby.category.${category}`) }}</span>
            </button>
        </div>
    </nav>
</template>

<script setup lang="ts">
import type { GameCategoryFilter } from '@/types/game';

// Define props, models and emits
defineProps<{
    activeCategory: GameCategoryFilter;
}>();

const emit = defineEmits<{
    'update:activeCategory': [category: GameCategoryFilter];
}>();

// Variables
// id 用英文，顯示名走 i18n（lobby.category.*）
const CATEGORIES: GameCategoryFilter[] = [
    'all',
    'slot',
    'fish',
    'card',
    'mini',
];
</script>

<style scoped lang="scss">
.category-filter {
    min-width: 0;

    &__list {
        overflow-x: auto;
        display: flex;
        padding: var(--corner-1) 0;

        // 分類之間不留間距：每個分類自己有左右內距 15，字與字自然隔 30
        // 手機版：平均散開撐滿整列；字長放不下時改成左右滑（電腦版維持靠左，右邊還有 NEW/HOT 與搜尋）
        @media (width < 960px) {
            justify-content: space-between;
        }
    }

    // 高 44 = 上 10（Corner-2）＋ 字 24 ＋ 下 10；選中時下面換成「間距 8 ＋ 底線 2」，高度一樣不跳
    // （外層 overflow-x: auto 的邊界在整個分類框外面）
    &__tab {
        cursor: pointer;

        position: relative;

        display: grid;
        flex-shrink: 0; // 不准被壓扁：空間不夠時改成整列可左右滑，不是把字擠爛
        justify-items: center;

        // 高度、左右內距、下內距外層都可改（工具列縮小版用）；min-height 讓字級被改小時高度不變，不然整排變矮、頁面會跳
        min-height: var(--category-tab-min-height, 44px);
        padding: var(--corner-2) var(--category-tab-padding-x, var(--corner-3))
            var(--category-tab-padding-bottom, var(--corner-2));
        border: 0;

        font-size: var(--category-tab-font-size, var(--font-size-20)); // 外層可改（工具列縮小版用）
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-40);
        white-space: nowrap; // 多語系：分類名不換行，整列可橫向捲動

        background: none;

        // 字級、內距、高度：工具列縮小版切換時平順變化
        transition:
            color var(--motion-hover),
            font-size 0.3s ease,
            padding 0.3s ease,
            min-height 0.3s ease;

        // 幽靈文字：永遠是粗體、看不見，把分類撐到選中時的寬度，點選時旁邊的分類才不會被推動
        // 🚨 不能加 overflow: hidden（會讓最小寬度變 0，照樣會晃）
        &::before {
            content: attr(data-text);

            grid-area: 1 / 1;

            height: 0;

            font-weight: var(--font-weight-bold);

            visibility: hidden;
        }

        &::after {
            content: '';

            position: absolute;
            bottom: var(--category-tab-underline-bottom, 0); // 外層可改（工具列縮小版讓底線貼近字）
            left: 50%;
            transform: translateX(-50%);

            width: 30px;
            height: 2px;
            border-radius: var(--corner-full);

            opacity: 0;
            background: var(--color-primary-20);

            transition:
                opacity 0.2s,
                bottom 0.3s ease;
        }

        &--active {
            font-weight: var(--font-weight-bold);
            color: var(--color-primary-10);

            &::after {
                opacity: 1;
            }
        }

        @media (hover: hover) {
            &:hover {
                color: var(--color-primary-10);
            }
        }

        @media (width >= 960px) {
            &::after {
                width: 50px;
                background: var(--color-primary-10);
            }
        }
    }

    &__label {
        grid-area: 1 / 1;
    }
}
</style>
