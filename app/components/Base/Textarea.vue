<template>
    <div class="base-textarea">
        <textarea
            :id="id"
            v-model="modelValue"
            class="base-textarea__input"
            :maxlength="maxlength"
            :placeholder="placeholder"
        />

        <!-- 右下角字數：0/500 -->
        <span
            aria-live="polite"
            class="base-textarea__count"
        >
            {{ modelValue.length }}/{{ maxlength }}
        </span>
    </div>
</template>

<script setup lang="ts">
// Define props, models and emits
withDefaults(
    defineProps<{
        id?: string;
        maxlength?: number;
        placeholder?: string;
    }>(),
    {
        id: undefined,
        maxlength: 500,
        placeholder: '',
    },
);

const modelValue = defineModel<string>({ default: '' });
</script>

<style scoped lang="scss">
// 外觀跟輸入框同一套（Figma input / input_act）
.base-textarea {
    display: flex;
    flex-direction: column;
    gap: var(--corner-1);

    padding: var(--corner-2) var(--corner-3);
    border-radius: var(--corner-input);

    background: var(--bg-input);
    box-shadow: var(--shadow-input);

    transition: box-shadow 0.25s ease;

    // 游標在裡面時多一圈內光（Figma input_act）
    &:focus-within {
        box-shadow: var(--shadow-input-active);
    }

    // ⚠️ 字級暫定 H5 16 / PC 20（跟下拉、輸入框同一套）
    &__input {
        resize: none;

        flex: 1;

        min-height: 0;
        padding: 0;
        border: 0;

        font-size: 16px;
        font-weight: 300;
        line-height: 140%;
        color: var(--color-primary-10);

        background: transparent;
        outline: none;

        &::placeholder {
            color: var(--color-primary-40);
        }
    }

    // Figma：0/500 在右下角、灰字
    &__count {
        align-self: flex-end;
        font-size: 16px;
        font-weight: 300;
        color: var(--color-primary-40);
    }

    @media (width >= 600px) {
        &__input,
        &__count {
            font-size: 20px;
        }
    }
}
</style>
