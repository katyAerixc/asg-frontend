<template>
    <button
        class="base-button"
        :disabled="disabled"
        :type="type"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
// Define props, models and emits
withDefaults(
    defineProps<{
        disabled?: boolean;
        type?: 'button' | 'submit';
    }>(),
    {
        disabled: false,
        type: 'button',
    },
);
</script>

<style scoped lang="scss">
// Figma btn/default：200 x 46、圓角 full、左右內距 28
// 文字 18 / 500 / 白 + 3px 深藍描邊（跟「加載更多」同一組）
.base-button {
    cursor: pointer;

    width: 200px;
    max-width: 100%;
    height: 46px;
    padding: 0 28px;
    border: 0;
    border-radius: var(--corner-full);

    font-size: 18px;
    font-weight: 500;
    line-height: 100%;
    color: var(--color-neutral-10);

    // 等同 Figma 的 Outer 描邊：先描邊再填字，筆畫才不會被吃掉
    paint-order: stroke fill;

    background: var(--bg-button-primary);
    box-shadow: var(--shadow-btn);

    transition: box-shadow 0.25s ease;

    -webkit-text-stroke: 3px var(--color-navy-50);

    // Figma button/Default/Disabled：還不能按的時候
    &:disabled {
        cursor: not-allowed;
        background: var(--bg-button-disabled);
        box-shadow: var(--shadow-btn-disabled);
    }

    // 只有真的有滑鼠的裝置才做 hover；手機沒有滑鼠，點完 :hover 會黏著不放
    @media (hover: hover) {
        &:hover:not(:disabled) {
            box-shadow: var(--shadow-btn-glow-on), var(--shadow-btn);
        }
    }
}
</style>
