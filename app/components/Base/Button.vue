<template>
    <button
        class="base-button"
        :class="[`base-button--${size}`, `base-button--${variant}`]"
        :disabled="disabled"
        :type="type"
    >
        <slot />
    </button>
</template>

<script setup lang="ts">
// Define props, models and emits
// size 對應 Figma 的兩種尺寸（btn/default 與 btn/Large），
// variant 對應 Figma 的顏色選項（btn 屬性：預設藍／次要白／強調橘）。
// 這裡用開關（而不是傳值）是因為設計系統就只有這幾種，不會冒出第四種；
// 彈窗高度那種「值有無限多可能」的才用 prop 傳數字（見 Base/Modal.vue）
withDefaults(
    defineProps<{
        disabled?: boolean;
        size?: 'default' | 'large';
        type?: 'button' | 'submit';
        variant?: 'highlight' | 'primary' | 'secondary';
    }>(),
    {
        disabled: false,
        size: 'default',
        type: 'button',
        variant: 'primary',
    },
);
</script>

<style scoped lang="scss">
// Figma btn/Medium（程式叫 default）、btn/Large
// 尺寸都在 index.scss 的 --button-*，手機電腦的切換也在那裡；這裡只吃變數（她 2026-09-15 定）
.base-button {
    cursor: pointer;

    max-width: 100%;
    border: 0;
    border-radius: var(--corner-full);

    font-weight: var(--font-weight-medium);
    color: var(--color-neutral-10);

    // 等同 Figma 的 Outer 描邊：先描邊再填字，筆畫才不會被吃掉
    paint-order: stroke fill;

    box-shadow: var(--shadow-btn);

    transition: box-shadow 0.25s ease;

    // Figma btn 屬性：預設藍、次要白（客服「上一頁」）、強調橘（「立即遊玩」）
    // 文字描邊每種不一樣：藍的粗描邊（跟首頁「加載更多」同一組），白與橘是細的黑框
    &--primary {
        background: var(--bg-button-modal);

        -webkit-text-stroke: var(--text-stroke-button-modal);
    }

    // 白底但文字仍是白的，靠黑色描邊撐出可讀性（她 2026-09-11 指定 2px 黑 70%）
    &--secondary {
        color: var(--color-neutral-10);
        background: var(--bg-button-secondary);

        -webkit-text-stroke: 2px var(--color-black-70);
    }

    &--highlight {
        background: var(--bg-button-highlight);

        -webkit-text-stroke: 1px var(--color-black-50);
    }

    &--default {
        width: var(--button-medium-width);
        height: var(--button-medium-height);
        padding: 0 var(--button-medium-padding-x);
        font-size: var(--button-medium-font-size);
    }

    &--large {
        width: var(--button-large-width);
        height: var(--button-large-height);
        padding: 0 var(--button-large-padding-x);
        font-size: var(--button-large-font-size);
    }

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
