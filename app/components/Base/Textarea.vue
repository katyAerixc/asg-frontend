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

            <!-- 有字才出現清除鈕（Figma：右上角 ✕；做法跟暱稱輸入框同一套） -->
            <button
                v-if="modelValue"
                :aria-label="$t('common.clear')"
                class="base-textarea__clear i-sp-close"
                type="button"
                @click="clear"
            />
        </div>

        <!-- 右下角字數：0/500 -->
        <span
            aria-live="polite"
            class="base-textarea__count"
            :class="{ 'base-textarea__count--filled': modelValue.length > 0 }"
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
    gap: var(--corner-2); // Figma PC/input：文字區 → 字數 10

    padding: var(--input-padding-y) var(--input-padding-x);
    border-radius: var(--corner-input);

    background: var(--bg-input);
    backdrop-filter: blur(25px); // Figma input：bg-blur 50 ÷ 2
    box-shadow: var(--shadow-input);

    transition: box-shadow 0.25s ease;

    // 游標在裡面時多一圈內光
    &:focus-within {
        box-shadow: var(--shadow-input-act);
    }

    // 輸入區與 ✕ 左右排：✕ 固定寬，輸入區吃剩下的
    &__body {
        display: flex;
        flex: 1;
        gap: var(--corner-2);
        align-items: flex-start;

        min-height: 0;
    }

    // ⚠️ 字級暫定 H5 16 / PC 20（跟下拉、輸入框同一套）
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
        line-height: 1.4;
        color: var(--color-primary-10);

        background: transparent;
        outline: none;

        // Figma 4-1：描述框的提示文字是 Primary/30 #8F9BAD（比下拉的 Primary/40 淡一階）。
        // 她 2026-09-16 指示「要依照 Figma」，所以兩個欄位刻意不同色
        &::placeholder {
            color: var(--color-primary-30);
        }
    }

    // ⚠️ 尺寸暫定 12（跟暱稱輸入框的 ✕ 同大小），Figma 未量
    // 字級跟輸入文字一樣，margin-top 用 em 算：✕ 永遠跟第一行文字置中，H5 / PC 都對得上
    &__clear {
        cursor: pointer;

        flex-shrink: 0;

        width: 12px;
        height: 12px;
        margin-top: calc((1.4em - 12px) / 2);
        padding: 0;
        border: 0;

        font-size: var(--input-font-size);
        color: var(--color-input-clear);

        background-color: currentcolor;

        transition: opacity 0.2s;

        @media (hover: hover) {
            &:hover {
                opacity: 0.7;
            }
        }
    }

    // Figma：0/500 在右下角、灰字
    &__count {
        align-self: flex-end;
        font-size: var(--input-font-size);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-30); // Figma 0/500：Primary/30

        // 打了字：字數變深（淺色 Primary/10），提醒已經有內容
        &--filled {
            color: var(--color-textarea-count-filled);
        }
    }
}
</style>
