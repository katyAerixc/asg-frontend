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
// 外觀跟輸入框同一套（Figma input / input_act）
.base-textarea {
    display: flex;
    flex-direction: column;
    gap: var(--corner-1);

    padding: var(--input-padding-y) var(--input-padding-x);
    border-radius: var(--corner-input);

    background: var(--bg-input);
    box-shadow: var(--shadow-input);

    transition: box-shadow 0.25s ease;

    // 游標在裡面時多一圈內光（Figma input_act）
    &:focus-within {
        box-shadow: var(--shadow-input-active);
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

        &::placeholder {
            color: var(--color-primary-40);
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
        color: var(--color-primary-40);

        // 打了字：字數變深（淺色 Primary/10），提醒已經有內容
        &--filled {
            color: var(--color-textarea-count-filled);
        }
    }
}
</style>
