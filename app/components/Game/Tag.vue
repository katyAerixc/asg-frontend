<template>
    <span
        class="game-tag"
        :class="`game-tag--${type.toLowerCase()}`"
    >
        {{ type }}
    </span>
</template>

<script setup lang="ts">
// Define props, models and emits
// 值直接當文字顯示，所以維持大寫（NEW / HOT / HIGH），不走 i18n——這三個字各國語言都不翻
defineProps<{ type: string }>();
</script>

<style scoped lang="scss">
// Figma：內距 Corner-1／Corner-2、1px 白框、左上與右下 Corner-3（另外兩角是直角）
// 遊戲卡與遊戲介紹彈窗共用同一顆（2026-09-11 確認兩邊規格完全一樣）
.game-tag {
    display: flex;
    gap: 10px;
    align-items: center;
    justify-content: center;

    // 高度 min-height 手機 27、電腦 29；內距照 Figma pad 4/10（她 2026-09-17 說照 Figma，取代 09-14 上下 0）
    min-height: 27px;
    padding: var(--corner-1) var(--corner-2);

    // 用 neutral-10 不是 primary-10：淺色主題不覆寫 neutral，標籤兩個主題長得一樣（她 2026-09-11 指定）
    border: 1px solid var(--color-neutral-10);
    border-radius: var(--corner-3) 0;

    font-size: var(--font-size-14); // 手機 14、電腦 16（見下方 media query）
    font-weight: var(--font-weight-bold);
    color: var(--color-neutral-10);
    text-shadow: 0 1px 0 var(--color-black-50);

    box-shadow:
        0 -2px 0 0 var(--color-black-25) inset,
        0 0 10px 0 var(--color-black-80);

    &--new {
        background: linear-gradient(90deg, var(--color-semantic-green-20) 0%, var(--color-semantic-green-30) 100%);
    }

    &--hot {
        background: linear-gradient(90deg, var(--color-semantic-red-20) 0%, var(--color-semantic-red-30) 100%);
    }

    &--high {
        background: linear-gradient(90deg, var(--color-semantic-yellow-20) 0%, var(--color-semantic-yellow-30) 100%);
    }

    @media (width >= 960px) {
        min-height: 29px; // Figma PC/Game/Tag 高 29（手機 27）
        font-size: var(--font-size-16);
    }
}
</style>
