<template>
    <!-- RTP 漲跌箭頭：22×22，Figma 兩個 SVG 只差上下翻轉，所以用一個 path + CSS 翻 -->
    <svg
        aria-hidden="true"
        class="icon-trend"
        :class="{ 'icon-trend--down': direction === 'down' }"
        fill="none"
        height="22"
        viewBox="0 0 22 22"
        width="22"
        xmlns="http://www.w3.org/2000/svg"
    >
        <!-- eslint-disable vue/max-len -->
        <path
            d="M6.08824 6V7.66471H12.6588L5.5 14.8235L6.67647 16L13.8353 8.84118L13.8353 15.4118L15.5 15.4118V6H6.08824Z"
            fill="currentColor"
        />
        <!-- eslint-enable vue/max-len -->
    </svg>
</template>

<script setup lang="ts">
defineProps<{
    direction: 'down' | 'up';
}>();
</script>

<style scoped lang="scss">
.icon-trend {
    flex-shrink: 0;

    &--down {
        transform: scaleY(-1);
    }
}
</style>
