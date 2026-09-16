<template>
    <nav class="category-filter">
        <div class="category-filter__list">
            <button
                v-for="category in CATEGORIES"
                :key="category"
                class="category-filter__tab"
                :class="{ 'category-filter__tab--active': activeCategory === category }"
                :data-text="$t(`lobby.category.${category}`)"
                type="button"
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
        padding: var(--corner-1) 0; // Figma MB/Tag：52 = 上 4 ＋ Tab 44 ＋ 下 4

        // 分類之間不留間距：每個分類自己有左右內距 15，字與字自然隔 30（Figma PC/Tab、MB/Tab）
        // 手機版：平均散開撐滿整列；字長放不下時改成左右滑（電腦版維持靠左，右邊還有 NEW/HOT 與搜尋）
        @media (width < 960px) {
            justify-content: space-between;
        }
    }

    // 分類：Figma PC/Tab、MB/Tab（她 2026-09-15 給）
    // 高 44 = 上 10（Corner-2）＋ 字 24 ＋ 下 10；選中時下面換成「間距 8 ＋ 底線 2」，高度一樣不跳
    // 行高照 Figma 1.2（24），不用專案預設的 1.4：字外面沒有貼著的牆，上下各有 10 內距讓越南文、泰文的聲調超出也不會被切
    // （外層 overflow-x: auto 的邊界在整個分類框外面；她 2026-09-15 同意）
    &__tab {
        cursor: pointer;

        position: relative;

        display: grid;
        flex-shrink: 0; // 不准被壓扁：空間不夠時改成整列可左右滑，不是把字擠爛
        justify-items: center;

        padding: var(--corner-2) var(--corner-3);
        border: 0;

        font-size: var(--font-size-20);
        font-weight: var(--font-weight-regular);
        line-height: 1.2;
        color: var(--color-primary-40);
        white-space: nowrap; // 多語系：分類名不換行，整列可橫向捲動

        background: none;

        transition: color 0.2s;

        // 幽靈文字：永遠是粗體、看不見，把分類撐到選中時的寬度，點選時旁邊的分類才不會被推動
        // 🚨 不能加 overflow: hidden（會讓最小寬度變 0，照樣會晃；見 CHECKLIST 踩坑）
        &::before {
            content: attr(data-text);

            grid-area: 1 / 1;

            height: 0;

            font-weight: var(--font-weight-bold);

            visibility: hidden;
        }

        // 選中的底線：Figma 手機 30 × 2 Primary/20、電腦 50 × 2 Primary/10，圓角 full，置中
        &::after {
            content: '';

            position: absolute;
            bottom: 0;
            left: 50%;
            transform: translateX(-50%);

            width: 30px;
            height: 2px;
            border-radius: var(--corner-full);

            opacity: 0;
            background: var(--color-primary-20);

            transition: opacity 0.2s;
        }

        &--active {
            font-weight: var(--font-weight-bold);
            color: var(--color-primary-10);

            &::after {
                opacity: 1;
            }
        }

        // 只有真的有滑鼠的裝置才做 hover；手機沒有滑鼠，點完 :hover 會黏著不放
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
