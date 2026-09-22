<template>
    <BaseModal
        height="auto"
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
                    type="text"
                    :placeholder="$t('profile.nicknamePlaceholder')"
                    @keydown.enter="confirmOnEnter"
                >

                <button
                    v-if="draft"
                    class="nickname-editor__clear i-sp-close"
                    type="button"
                    :aria-label="$t('common.clear')"
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

// Store
const userStore = useUserStore();
const { draftNickname, nickname } = storeToRefs(userStore);
const { updateNickname } = userStore;

// State
// 先改在草稿上，按了「確認」才真的存；關掉再打開，打到一半的字還在
const draft = computed({
    get: () => draftNickname.value ?? nickname.value,
    set: (value: string) => {
        draftNickname.value = value;
    },
});
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

// 🚨 打中文時 Enter 是「選字」：正在組字就不送出。要用 keydown 判斷，keyup 那時組字已結束、分不出來
function confirmOnEnter(event: KeyboardEvent) {
    if (!event.isComposing) confirm();
}

// Hooks
onMounted(() => {
    inputRef.value?.focus();
});
</script>

<style scoped lang="scss">
.nickname-editor {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--corner-2);

    &__label {
        font-size: var(--font-size-18);
        font-weight: var(--font-weight-medium);
        color: var(--color-neutral-10);
    }

    &__field {
        display: flex;
        gap: var(--corner-2);
        align-items: center;

        // 高度寫死才對得上 Figma；行高交給瀏覽器算，文字不會被裁
        height: 39px;
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

        @media (hover: hover) {
            &:hover {
                box-shadow: var(--shadow-input-act-stroke);
            }
        }
    }

    &__input {
        flex: 1;

        min-width: 0;
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

    // 框比圖大，用 mask-size 縮圖、置中
    &__clear {
        cursor: pointer;

        flex-shrink: 0;

        width: 19px;
        height: 19px;
        padding: 0;
        border: 0;

        color: var(--color-primary-10);

        background-color: currentcolor;

        mask-position: center;
        mask-size: 11.4px 11.4px;

        transition: opacity 0.2s;

        @media (hover: hover) {
            &:hover {
                opacity: 0.7;
            }
        }
    }

    @media (width >= 600px) {
        align-self: center;
        width: 100%;
        max-width: 510px;

        &__label {
            font-size: var(--font-size-20);
        }

        &__field {
            height: 44px;
        }

        &__clear {
            width: 24px;
            height: 24px;
            mask-size: 14.4px 14.4px;
        }
    }
}
</style>
