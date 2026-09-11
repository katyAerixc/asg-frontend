<template>
    <nav class="category-filter">
        <div class="category-filter__list">
            <button
                v-for="category in CATEGORIES"
                :key="category"
                class="category-filter__tab"
                :class="{ 'category-filter__tab--active': activeCategory === category }"
                type="button"
                @click="emit('update:activeCategory', category)"
            >
                {{ $t(`lobby.category.${category}`) }}
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
// id 用英文，顯示名走 i18n（lobby.category.*）。順序照設計稿
const CATEGORIES: GameCategoryFilter[] = [
    'all',
    'slot',
    'fish',
    'card',
    'mini',
];
</script>

<style scoped lang="scss">
// 設計稿：分類列沒有底線（只有 Header 下面有線）
.category-filter {
    min-width: 0;

    &__list {
        overflow-x: auto;
        display: flex;
        gap: 24px;

        // 手機版：平均散開撐滿整列（電腦版維持靠左，右邊還有 NEW/HOT 與搜尋）
        // gap 縮到 8px 當「最小間距」，窄畫面才有空間散得開
        @media (width < 960px) {
            gap: 8px;
            justify-content: space-between;
        }
    }

    // 分類文字：Inter 20px / 300、未選中 #697B96（Figma）；選中白色 + 白底線（設計稿）
    &__tab {
        cursor: pointer;

        flex-shrink: 0; // 不准被壓扁：空間不夠時改成整列可左右滑，不是把字擠爛

        padding: 8px 0;
        border: 0;
        border-bottom: 2px solid transparent;

        font-size: 20px;
        font-weight: 300;
        color: var(--color-primary-40);
        white-space: nowrap; // 多語系：分類名不換行，整列可橫向捲動

        background: none;

        transition: color 0.2s;

        &--active {
            border-bottom-color: var(--color-primary-10);
            font-weight: 700;
            color: var(--color-primary-10);
        }

        // 只有真的有滑鼠的裝置才做 hover；手機沒有滑鼠，點完 :hover 會黏著不放
        @media (hover: hover) {
            &:hover {
                color: var(--color-primary-10);
            }
        }
    }
}
</style>
