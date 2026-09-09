<template>
    <nav class="category-filter">
        <div class="category-filter__list">
            <button
                v-for="category in categories"
                :key="category"
                class="category-filter__tab"
                :class="{ 'category-filter__tab--active': activeCategory === category }"
                type="button"
                @click="emit('update:activeCategory', category)"
            >
                {{ category }}
            </button>
        </div>
    </nav>
</template>

<script setup lang="ts">
// Define props, models and emits
defineProps<{
    activeCategory: string;
}>();

const emit = defineEmits<{
    'update:activeCategory': [category: string];
}>();

// Variables
// ⚠️ 之後接 i18n 改成翻譯 key
const categories = [
    '全部',
    '老虎機',
    '魚機',
    '棋牌',
    '小遊戲',
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
    }

    // 分類文字：Inter 20px / 300、未選中 #697B96（Figma）；選中白色 + 白底線（設計稿）
    &__tab {
        cursor: pointer;

        padding: 8px 0;
        border: 0;
        border-bottom: 2px solid transparent;

        font-size: 20px;
        font-weight: 500;
        color: var(--color-primary-40);
        white-space: nowrap; // 多語系：分類名不換行，整列可橫向捲動

        background: none;

        transition: color 0.2s;

        &:hover {
            color: var(--color-primary-10);
        }

        &--active {
            border-bottom-color: var(--color-primary-10);
            font-weight: 700;
            color: var(--color-primary-10);
        }
    }
}
</style>
