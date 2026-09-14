<template>
    <div class="base-upload">
        <!-- 還沒選檔案：整塊就是一顆按鈕，點下去開檔案總管 -->
        <button
            v-if="!previewUrl"
            :aria-label="$t('support.attachmentLabel')"
            class="base-upload__box"
            type="button"
            @click="openPicker"
        >
            <span class="base-upload__icon i-sp-upload" />
        </button>

        <!-- 選好了：顯示縮圖，底部壓一條「刪除」 -->
        <div
            v-else
            class="base-upload__box base-upload__box--filled"
        >
            <img
                alt=""
                class="base-upload__thumb"
                :src="previewUrl"
            >

            <button
                class="base-upload__remove"
                type="button"
                @click="clear"
            >
                {{ $t('support.remove') }}
            </button>
        </div>

        <!-- 格式與大小說明；檔案太大時同一行換成紅字警告 -->
        <p
            class="base-upload__hint"
            :class="{ 'base-upload__hint--error': errorKey }"
        >
            {{ errorKey ? $t(errorKey) : $t('support.attachmentHint') }}
        </p>

        <!-- 真正的檔案輸入框藏起來，外觀完全交給上面那塊 -->
        <input
            ref="inputRef"
            :accept="accept"
            class="base-upload__input"
            type="file"
            @change="onChange"
        >
    </div>
</template>

<script setup lang="ts">
// Define props, models and emits
const props = withDefaults(
    defineProps<{
        accept?: string;
        maxBytes?: number;
    }>(),
    {
        accept: 'image/jpeg,image/png',
        maxBytes: 15 * 1024 * 1024,
    },
);

// 沒選檔案時是 null，外面用 v-model 接
const modelValue = defineModel<File | null>({ default: null });

// State
const inputRef = ref<HTMLInputElement | null>(null);
const previewUrl = ref('');

// 沒問題是 null；被擋下來時放翻譯 key，說明那行就換成紅字警告
const errorKey = ref<null | string>(null);

// Functions
function clear() {
    revokePreview();
    errorKey.value = null;
    modelValue.value = null;

    // 同一個檔案再選一次也要能觸發 change，所以把輸入框的值清掉
    if (inputRef.value) inputRef.value.value = '';
}

function onChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];

    if (!file) return;

    // 兩道關卡：格式與大小。任一不過就不收，說明那行變紅字告訴她原因。
    // accept 只是讓檔案總管預設篩選，使用者切成「所有檔案」還是選得到，所以這裡要自己再擋一次
    if (!props.accept.split(',').includes(file.type)) {
        clear();
        errorKey.value = 'support.attachmentWrongType';

        return;
    }

    if (file.size > props.maxBytes) {
        clear();
        errorKey.value = 'support.attachmentTooLarge';

        return;
    }

    revokePreview();
    errorKey.value = null;
    modelValue.value = file;
    previewUrl.value = URL.createObjectURL(file);
}

function openPicker() {
    inputRef.value?.click();
}

// 縮圖網址是瀏覽器臨時發的，換檔或離開時要自己收回來，不然記憶體會一直長
function revokePreview() {
    if (!previewUrl.value) return;

    URL.revokeObjectURL(previewUrl.value);
    previewUrl.value = '';
}

// Hooks
onUnmounted(revokePreview);
</script>

<style scoped lang="scss">
// Figma Group 1537（上傳方塊）／Frame 11387（刪除條）
.base-upload {
    display: flex;
    gap: var(--corner-2);

    // 說明文字對齊方塊的「下緣」，不是上緣（她 2026-09-11 指定）
    align-items: flex-end;

    // Figma：70 x 70、底色 Primary/20 的 20%、1px Primary/40 內框
    // 圓角 Figma 沒直接給（那層是 Group，面板不顯示 Radius），
    // 但底下的刪除條下兩角寫明 Corner-2，方塊本身一定同值，否則會露出直角
    &__box {
        cursor: pointer;

        position: relative;

        overflow: hidden;
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;

        // Figma：H5 70 x 70、PC 100 x 100
        width: 70px;
        height: 70px;
        padding: 0;
        border: 0;
        border-radius: var(--corner-2);

        background: var(--color-primary-opacity-2020);

        // 虛線框畫在這一層。為什麼不用 border: 1px dashed？
        // CSS 的 dashed 沒辦法指定「線多長、空多寬」，瀏覽器自己決定（看起來很密）。
        // 改成拿一張 SVG 當遮罩：dasharray='8 6' 就是實線 8、空白 6，想調就改這個數字。
        // ⚠️ SVG 的尺寸要跟方塊一致（100 x 100），不然虛線會被拉長變形。
        &::before {
            content: '';

            position: absolute;
            inset: 0;

            border-radius: inherit;

            background-color: var(--color-primary-40);

            mask: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='70' height='70'%3E%3Crect x='0.5' y='0.5' width='69' height='69' rx='9.5' fill='none' stroke='%23000' stroke-dasharray='8 6'/%3E%3C/svg%3E")
                center / 100% 100% no-repeat;

            transition: background-color 0.2s;
        }

        // 有縮圖時整塊不再是按鈕，虛線也收起來（圖蓋滿整塊，不需要提示框）
        &--filled {
            cursor: default;

            &::before {
                content: none;
            }
        }

        @media (hover: hover) {
            &:hover::before {
                background-color: var(--color-primary-20);
            }
        }
    }

    // Figma icon：28 x 27，顏色同外框的 Primary/40
    // UnoCSS 的圖示是遮罩，尺寸要用 mask-size，background-size 對遮罩沒作用
    &__icon {
        width: 28px;
        height: 27px;
        color: var(--color-primary-40);
        background-color: currentcolor;
    }

    &__thumb {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    // Figma Frame 11387：70 x 23、貼底、黑 80%、只有下兩角圓
    &__remove {
        cursor: pointer;

        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;

        height: 23px;
        padding: var(--corner-1) 0;
        border: 0;
        border-radius: 0 0 var(--corner-2) var(--corner-2);

        font-size: 12px;
        font-weight: 500;
        color: var(--color-neutral-10);

        background: var(--color-black-80);
    }

    // Figma：H5 14 / PC 16（她 2026-09-11 給值）。⚠️ 顏色暫定，跟 placeholder 同一套
    &__hint {
        margin: 0;

        font-size: 14px;
        font-weight: 300;
        line-height: 1.4;
        color: var(--color-primary-40);

        &--error {
            color: var(--color-red-20);
        }
    }

    &__input {
        display: none;
    }

    @media (width >= 600px) {
        &__box {
            width: 100px;
            height: 100px;

            // 虛線的 SVG 要跟著換尺寸，不然 8/6 的線段會被等比拉長
            &::before {
                mask-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect x='0.5' y='0.5' width='99' height='99' rx='9.5' fill='none' stroke='%23000' stroke-dasharray='8 6'/%3E%3C/svg%3E");
            }
        }

        &__hint {
            font-size: 16px;
        }
    }
}
</style>
