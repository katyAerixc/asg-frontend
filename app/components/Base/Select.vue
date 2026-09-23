<template>
    <div
        ref="rootRef"
        class="base-select"
        @keydown.escape="closeOnEscape"
    >
        <button
            :id="id"
            class="base-select__trigger"
            :class="{ 'base-select__trigger--open': isOpen }"
            aria-haspopup="listbox"
            type="button"
            :aria-expanded="isOpen"
            @click="isOpen = !isOpen"
        >
            <span
                class="base-select__value"
                :class="{ 'base-select__value--placeholder': !selected }"
            >
                {{ selected?.label ?? placeholder }}
            </span>
            <span
                class="base-select__caret i-sp-arrow-right"
                :class="{ 'base-select__caret--open': isOpen }"
            />
        </button>

        <ul
            v-if="isOpen"
            class="base-select__list"
            role="listbox"
        >
            <li
                v-for="option in options"
                :key="option.value"
                role="option"
                :aria-selected="option.value === modelValue"
            >
                <button
                    class="base-select__option"
                    :class="{ 'base-select__option--active': option.value === modelValue }"
                    type="button"
                    @click="choose(option.value)"
                >
                    {{ option.label }}
                </button>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
export interface SelectOption {
    label: string;
    value: string;
}

// Define props, models and emits
const props = withDefaults(
    defineProps<{
        id?: string;
        options: SelectOption[];
        placeholder?: string;
    }>(),
    {
        id: undefined,
        placeholder: '',
    },
);

// 沒選時是 null，外面用 v-model 接
const modelValue = defineModel<null | string>({ default: null });

// State
const rootRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

// Computed properties
const selected = computed(() => props.options.find((option) => option.value === modelValue.value) ?? null);

// Functions
function choose(value: string) {
    modelValue.value = value;
    isOpen.value = false;
}

// 展開時按 Esc 只收下拉，不要連外面的彈窗一起關；收起時放行給彈窗
function closeOnEscape(event: KeyboardEvent) {
    if (!isOpen.value) return;

    event.stopPropagation();
    isOpen.value = false;
}

// 點到選單以外的地方就收起來
function closeOnOutsideClick(event: MouseEvent) {
    if (!isOpen.value) return;
    if (rootRef.value?.contains(event.target as Node)) return;

    isOpen.value = false;
}

// Hooks
onMounted(() => {
    document.addEventListener('click', closeOnOutsideClick);
});

onUnmounted(() => {
    document.removeEventListener('click', closeOnOutsideClick);
});
</script>

<style scoped lang="scss">
// 外觀跟輸入框同一套，展開的清單跟語系下拉同一套
.base-select {
    position: relative;
    z-index: 2; // 展開的清單要蓋過下面的描述框

    &__trigger {
        cursor: pointer;

        display: flex;
        gap: var(--corner-2);
        align-items: center;

        width: 100%;
        height: 39px; // 電腦版在最下面改回 --select-height（44）
        padding: var(--input-padding-y) var(--input-padding-x);

        // 平常框線透明、展開時轉成 Primary/60。
        // 一開始就佔著 1px，展開時盒子才不會突然變大
        border: 1px solid transparent;
        border-radius: var(--corner-input);

        color: var(--color-primary-10);
        text-align: left;

        background: var(--bg-input);
        backdrop-filter: blur(25px); // Figma bg-blur 50 ÷ 2

        // 平常補一圈全透明的外圈，湊成跟 input_act 一樣的 4 層——層數不同 box-shadow 會直接跳、補不出漸變
        box-shadow:
            0 0 0 0 var(--color-white-0),
            var(--shadow-input);

        transition:
            border-color var(--motion-hover),
            box-shadow var(--motion-hover);

        // 展開時整個框亮起來
        &:focus-visible,
        &--open {
            border-color: var(--color-primary-60);
            outline: none;
            box-shadow: var(--shadow-input-act);
        }

        @media (hover: hover) {
            &:hover {
                border-color: var(--color-primary-60);
                box-shadow: var(--shadow-input-act);
            }
        }
    }

    // 展開時字與箭頭都轉 Primary/10，連提示字也是
    &__trigger--open &__value,
    &__trigger--open &__caret {
        color: var(--color-primary-10);
    }

    &__value {
        // 「…」要裁左右；上下不裁，聲調、泰文上下標才不會被切
        overflow: clip visible;
        flex: 1;

        // clip 不像 hidden 會讓它自動縮得比字窄，要自己寫 0，「…」才出得來
        min-width: 0;

        font-size: var(--input-font-size);
        font-weight: var(--font-weight-regular);
        text-overflow: ellipsis;
        white-space: nowrap;

        &--placeholder {
            color: var(--color-primary-40);
        }
    }

    // 用跟選單列同一支箭頭（arrow-right），靠旋轉決定方向：收起朝下、展開朝上
    &__caret {
        transform: rotate(90deg);

        flex-shrink: 0;

        width: 19px;
        height: 19px;

        color: var(--color-primary-40);

        background-color: currentcolor;

        transition: transform 0.25s;

        &--open {
            transform: rotate(-90deg);
        }
    }

    // 展開的清單：貼在框下方、同寬、底色與框同一套
    &__list {
        position: absolute;
        top: calc(100% + var(--select-list-offset));
        right: 0;
        left: 0;

        margin: 0;

        // 圓角 8 寫死：Figma 沒綁變數
        padding: 0 var(--corner-2);
        border-radius: 8px;

        list-style: none;

        background: var(--bg-input);
        backdrop-filter: blur(25px); // Figma bg-blur 50 ÷ 2
        box-shadow: var(--shadow-input-act);
    }

    // 每一列之間 1px 分隔線（最後一列不畫）
    li:not(:last-child) &__option {
        // 深色：border-image 漸層蓋掉框色；淺色：border-image 是 none，顯示 Primary/40 實線
        border-bottom: 1px solid var(--color-select-option-line);
        border-image: var(--line-select-option);
    }

    &__option {
        cursor: pointer;

        width: 100%;
        padding: var(--corner-2);
        border: 0;

        font-size: var(--font-size-16);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-20);
        text-align: justify;

        background: transparent;

        transition: background-color 0.2s;

        &--active {
            color: var(--color-primary-10);
            background-color: rgb(var(--color-primary-60-rgb) / 20%);
        }

        @media (hover: hover) {
            &:hover {
                background-color: rgb(var(--color-primary-60-rgb) / 20%);
            }
        }
    }

    @media (width >= 600px) {
        &__trigger {
            height: var(--select-height);
        }

        &__caret {
            width: 24px;
            height: 24px;
        }

        &__option {
            font-size: var(--font-size-20);
        }
    }
}
</style>
