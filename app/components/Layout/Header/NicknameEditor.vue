<template>
    <BaseModal
        gap="18px"
        height="248px"
        height-pc="300px"
        :title="$t('profile.nicknameTitle')"
        @close="$emit('close')"
    >
        <div class="nickname-editor">
            <label
                class="nickname-editor__label"
                :for="inputId"
            >
                {{ $t('profile.nicknameLabel') }}
            </label>

            <div class="nickname-editor__field">
                <input
                    :id="inputId"
                    ref="inputRef"
                    v-model="draft"
                    class="nickname-editor__input"
                    maxlength="20"
                    :placeholder="$t('profile.nicknamePlaceholder')"
                    type="text"
                    @keyup.enter="confirm"
                >

                <!-- 有字才出現清除鈕（設計稿：空的時候整顆不在） -->
                <button
                    v-if="draft"
                    :aria-label="$t('common.clear')"
                    class="nickname-editor__clear i-sp-close"
                    type="button"
                    @click="clear"
                />
            </div>
        </div>

        <template #footer>
            <BaseButton
                :disabled="!canSubmit"
                @click="confirm"
            >
                {{ $t('common.confirm') }}
            </BaseButton>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
// Emits
const emit = defineEmits<{ close: [] }>();

// Composables
const { nickname, updateNickname } = useProfile();

// State
// 先改在草稿上，按了「確認」才真的存——中途關掉等於放棄
const draft = ref(nickname.value);
const inputRef = ref<HTMLInputElement | null>(null);

// 同頁若開兩個彈窗，label 的 for 才不會指到同一個輸入框
const inputId = `nickname-input-${useId()}`;

// Computed properties
// 空白、或跟原本一樣，都不能送出
const canSubmit = computed(() => {
    const next = draft.value.trim();

    return Boolean(next) && next !== nickname.value;
});

// Functions
function clear() {
    draft.value = '';
    inputRef.value?.focus();
}

function confirm() {
    if (!canSubmit.value) return;

    updateNickname(draft.value);
    emit('close');
}

// Hooks
onMounted(() => {
    inputRef.value?.focus();
});
</script>

<style scoped lang="scss">
// 全部數值來自 Figma 屬性面板（她 2026-09-10 提供 12 張截圖）
.nickname-editor {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--corner-2);

    // Figma：H5 18 / 500 / 白（PC 20）
    &__label {
        font-size: 18px;
        font-weight: 500;
        line-height: 1.4;
        color: var(--color-neutral-10);
    }

    // Figma：H5 高 39、內距上下 Corner-2 左右 Corner-3、圓角 Corner-input、底色 Primary/90
    &__field {
        display: flex;
        gap: var(--corner-2);
        align-items: center;

        // 高度寫死才對得上 Figma；行高交給瀏覽器算，文字不會被裁
        height: 39px;
        padding: var(--corner-2) var(--corner-3);
        border-radius: var(--corner-input);

        background: var(--bg-input);
        box-shadow: var(--shadow-input);

        transition: box-shadow 0.25s ease;

        // 游標在裡面時多一圈內光（Figma input_act）
        &:focus-within {
            box-shadow: var(--shadow-input-active);
        }
    }

    // Figma：輸入文字 16 / 300 / 白；placeholder 同大小但 Primary/40
    &__input {
        flex: 1;

        min-width: 0;
        border: 0;

        font-size: 16px;
        font-weight: 300;
        line-height: normal;
        color: var(--color-primary-10);

        background: transparent;
        outline: none;

        &::placeholder {
            color: var(--color-primary-40);
        }
    }

    // Figma：19 x 19 的點擊區，裡面的叉 11.4
    &__clear {
        cursor: pointer;

        flex-shrink: 0;

        width: 12px;
        height: 12px;
        padding: 0;
        border: 0;

        color: var(--color-primary-10);

        background-color: currentcolor;

        transition: opacity 0.2s;

        @media (hover: hover) {
            &:hover {
                opacity: 0.7;
            }
        }
    }

    // 電腦版：Figma 輸入框 510 x 44（彈窗可用 570，左右各留 30），標籤與輸入文字都 20
    @media (width >= 600px) {
        align-self: center;
        width: 100%;
        max-width: 510px;

        &__label {
            font-size: 20px;
        }

        &__field {
            height: 44px;
        }

        &__input {
            font-size: 20px;
        }
    }
}
</style>
