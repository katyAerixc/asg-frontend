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
// 尺寸都在 index.scss 的 --button-*，手機電腦的切換也在那裡；這裡只吃變數
// 寬度用 min-width：字短維持設計寬度，長語言（越南文「Chơi ngay」、日文「再度問い合わせ」）自己變寬不斷行
.base-button {
    cursor: pointer;

    max-width: 100%;
    border: 0;
    border-radius: var(--corner-full);

    font-weight: var(--font-weight-medium);
    color: var(--color-neutral-10);

    // 等同 Figma 的 Outer 描邊：先描邊再填字，筆畫才不會被吃掉
    paint-order: stroke fill;

    background: var(--btn-bg);
    backdrop-filter: blur(50px); // Figma bg-blur 100 ÷ 2
    box-shadow: var(--shadow-btn);

    transition:
        background 0.25s ease,
        box-shadow 0.25s ease;

    // 預設藍、次要白（客服「上一頁」）、強調橘（「立即遊玩」）
    // 文字描邊三種都一樣（跟首頁「加載更多」同一組）
    &--primary {
        --btn-bg: var(--bg-button-modal);
        --btn-bg-hv: var(--bg-button-modal-hv);
        --btn-bg-act: var(--bg-button-modal-act);

        -webkit-text-stroke: var(--text-stroke-button-modal);
    }

    // 白底但文字仍是白的，靠黑色描邊撐出可讀性（Figma 1px Black/50 外側 → CSS 2px，見 index.scss --text-stroke-button-primary）
    &--secondary {
        --btn-bg: var(--bg-button-secondary);
        --btn-bg-hv: var(--bg-button-secondary-hv);
        --btn-bg-act: var(--bg-button-secondary-act);

        color: var(--color-neutral-10);

        -webkit-text-stroke: var(--text-stroke-button-primary);
    }

    &--highlight {
        --btn-bg: var(--bg-button-highlight);
        --btn-bg-hv: var(--bg-button-highlight-hv);
        --btn-bg-act: var(--bg-button-highlight-act);

        -webkit-text-stroke: var(--text-stroke-button-primary);
    }

    &--default {
        min-width: var(--button-medium-width);
        height: var(--button-medium-height);
        padding: 0 var(--button-medium-padding-x);
        font-size: var(--button-medium-font-size);
    }

    &--large {
        min-width: var(--button-large-width);
        height: var(--button-large-height);
        padding: 0 var(--button-large-padding-x);
        font-size: var(--button-large-font-size);
    }

    &:disabled {
        cursor: not-allowed;
        color: var(--color-button-disabled-text);
        background: var(--bg-button-disabled);
        box-shadow: var(--shadow-btn-disabled);
    }

    // 按下去：變暗＋外陰影消失，做出凹下去的感覺
    &:active:not(:disabled) {
        background: var(--btn-bg-act);
        box-shadow: var(--shadow-btn-active);
    }

    // hover：變亮＋外陰影換成白的
    // 加 :not(:active) 是因為按下去時 hover 也還成立，不排掉就會蓋掉上面的 act
    @media (hover: hover) {
        &:hover:not(:disabled, :active) {
            background: var(--btn-bg-hv);
            box-shadow: var(--shadow-btn-hover);
        }
    }
}
</style>
