<template>
    <div class="base-textarea">
        <div class="base-textarea__body">
            <textarea
                :id="id"
                ref="inputRef"
                v-model="modelValue"
                class="base-textarea__input"
                :maxlength="maxlength"
                :placeholder="placeholder"
            />

            <button
                v-if="modelValue"
                class="base-textarea__clear i-sp-close"
                type="button"
                :aria-label="$t('common.clear')"
                @click="clear"
            />
        </div>

        <span
            class="base-textarea__count"
            :class="{ 'base-textarea__count--filled': modelValue.length > 0 }"
            aria-live="polite"
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

// State
const inputRef = ref<HTMLTextAreaElement | null>(null);

// Functions
// 清空後把游標放回去，使用者可以直接重打
function clear() {
    modelValue.value = '';
    inputRef.value?.focus();
}
</script>

<style scoped lang="scss">
// 外觀跟輸入框同一套
.base-textarea {
    display: flex;
    flex-direction: column;
    gap: var(--corner-2);

    padding: var(--input-padding-y) var(--input-padding-x);
    border-radius: var(--corner-input);

    background: var(--bg-input);
    backdrop-filter: blur(25px); // Figma bg-blur 50 ÷ 2

    // 平常補兩層全透明的（框、外圈），湊成跟 input-act-stroke 一樣的 5 層——層數不同 box-shadow 會直接跳、補不出漸變
    box-shadow:
        0 0 0 0 var(--color-white-0) inset,
        0 0 0 0 var(--color-white-0),
        var(--shadow-input);

    transition: box-shadow var(--motion-hover);

    &:focus-within {
        box-shadow: var(--shadow-input-act-stroke);
    }

    // 輸入區與 ✕ 左右排：✕ 固定寬，輸入區吃剩下的
    &__body {
        display: flex;
        flex: 1;
        gap: var(--corner-2);
        align-items: flex-start;

        min-height: 0;
    }

    &__input {
        resize: none;

        flex: 1;
        align-self: stretch;

        min-width: 0;
        min-height: 0;
        padding: 0;
        border: 0;

        font-size: var(--input-font-size);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-10);

        background: transparent;
        outline: none;

        &::placeholder {
            color: var(--color-primary-40);
        }
    }

    // margin-top：讓 ✕ 跟第一行文字置中（字級跟輸入文字一樣，才能用 em 算）
    &__clear {
        cursor: pointer;

        flex-shrink: 0;

        width: 19px;
        height: 19px;
        margin-top: calc((var(--line-height-figma) * 1em - 19px) / 2);
        padding: 0;
        border: 0;

        font-size: var(--input-font-size);
        color: var(--color-primary-20);

        background-color: currentcolor;

        mask-position: center;
        mask-size: 11.4px 11.4px;

        transition: opacity 0.2s;

        @media (hover: hover) {
            &:hover {
                opacity: 0.7;
            }
        }

        @media (width >= 600px) {
            width: 24px;
            height: 24px;
            margin-top: calc((var(--line-height-figma) * 1em - 24px) / 2);

            color: var(--color-primary-40);

            mask-size: 14.4px 14.4px;
        }
    }

    &__count {
        align-self: flex-end;
        font-size: var(--input-font-size);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-30);

        // 打了字：字數變深（淺色 Primary/10），提醒已經有內容
        &--filled {
            color: var(--color-textarea-count-filled);
        }
    }

    @media (hover: hover) {
        &:hover {
            box-shadow: var(--shadow-input-act-stroke);
        }
    }
}
</style>
