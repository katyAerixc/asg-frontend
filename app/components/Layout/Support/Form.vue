<template>
    <form
        class="support-form"
        @submit.prevent="submit"
    >
        <div class="support-form__fields">
            <div class="support-form__field">
                <label
                    class="support-form__label"
                    :for="issueTypeId"
                >
                    {{ $t('support.issueTypeLabel') }}<span class="support-form__required">*</span>
                </label>

                <BaseSelect
                    :id="issueTypeId"
                    v-model="issueType"
                    :options="issueTypeOptions"
                    :placeholder="$t('support.issueTypePlaceholder')"
                />
            </div>

            <div class="support-form__field support-form__field--grow">
                <label
                    class="support-form__label"
                    :for="descriptionId"
                >
                    {{ $t('support.descriptionLabel') }}<span class="support-form__required">*</span>
                </label>

                <BaseTextarea
                    :id="descriptionId"
                    v-model="description"
                    class="support-form__textarea"
                    :maxlength="DESCRIPTION_MAX_LENGTH"
                    :placeholder="$t('support.descriptionPlaceholder')"
                />
            </div>

            <div class="support-form__field">
                <span class="support-form__label">{{ $t('support.attachmentLabel') }}</span>

                <BaseUpload
                    v-model="attachment"
                    :accept="ATTACHMENT_ACCEPT"
                    :max-bytes="ATTACHMENT_MAX_BYTES"
                />
            </div>
        </div>

        <!-- 兩個必填都有值才能按 -->
        <BaseButton
            class="support-form__submit"
            :disabled="!canSubmit"
            type="submit"
        >
            {{ $t('support.submit') }}
        </BaseButton>
    </form>
</template>

<script setup lang="ts">
// State
const issueType = ref<null | string>(null);
const description = ref('');
const attachment = ref<File | null>(null);

// 同頁可能開兩個彈窗，label 要指到自己的欄位
const issueTypeId = `support-issue-type-${useId()}`;
const descriptionId = `support-description-${useId()}`;

const { t } = useI18n();

// Computed properties
// 選項的文字要跟著語言變，所以在這裡把 key 轉成文字
const issueTypeOptions = computed(() => ISSUE_TYPES.map((item) => ({
    label: t(item.labelKey),
    value: item.value,
})));

const canSubmit = computed(() => Boolean(issueType.value) && description.value.trim().length > 0);

// Functions
// ⚠️ 還沒有後端，先只清空表單。接 API 時改這裡
function submit() {
    if (!canSubmit.value) return;

    issueType.value = null;
    description.value = '';
    attachment.value = null;
}
</script>

<style scoped lang="scss">
.support-form {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;

    // 欄位區可捲動，提交鈕永遠留在底部
    &__fields {
        overflow-y: auto;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-3);

        min-height: 0;
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: var(--corner-1);

        // 描述框固定高（Figma：H5 130、PC 200），不跟著彈窗長高
        &--grow {
            flex: none;
        }
    }

    // ⚠️ 字級暫定 16 / PC 20，Figma 未給
    &__label {
        font-size: 16px;
        font-weight: 500;
        line-height: 1.4;
        color: var(--color-primary-10);
    }

    // 星號跟標題同色（她 2026-09-11 指定，不要紅色）
    &__required {
        color: inherit;
    }

    &__textarea {
        flex: none;
        height: 130px;
    }

    // 尺寸由 BaseButton 自己管（H5 150 x 40、PC 200 x 46），這裡只管擺哪裡
    &__submit {
        align-self: center;
        margin-top: var(--corner-4);
    }

    @media (width >= 600px) {
        &__label {
            font-size: 20px;
        }

        // Figma PC/input：描述框 200 高
        &__textarea {
            height: 200px;
        }
    }
}
</style>
