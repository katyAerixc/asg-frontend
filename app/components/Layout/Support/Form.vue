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

        <BaseButton
            class="support-form__submit"
            type="submit"
            :disabled="!canSubmit"
        >
            {{ $t('support.submit') }}
        </BaseButton>
    </form>
</template>

<script setup lang="ts">
import { submitSupportTicket } from '@/libs/api/support';
import {
    ATTACHMENT_ACCEPT,
    ATTACHMENT_MAX_BYTES,
    DESCRIPTION_MAX_LENGTH,
    ISSUE_TYPES,
} from '@/libs/support';

// State
// 填到一半的內容放在 store，切頁籤、關視窗再打開都還在（「再次提問」也是改這裡的類型）
const supportStore = useSupportStore();
const {
    draftAttachment: attachment,
    draftDescription: description,
    draftIssueType: issueType,
} = storeToRefs(supportStore);

// 送出中：擋連點，按鈕也跟著變灰
const isSubmitting = ref(false);

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

const canSubmit = computed(() => {
    if (isSubmitting.value) return false;

    return Boolean(issueType.value) && description.value.trim().length > 0;
});

// 送出後重抓紀錄，新提問才會出現在「提問紀錄」
const { refresh: refreshRecords } = useSupportRecords();

// Functions
// 成功才清表單；失敗保留內容讓使用者重送（錯誤提示等後端規格確定再做）
async function submit() {
    if (!canSubmit.value || !issueType.value) return;

    isSubmitting.value = true;

    try {
        await submitSupportTicket({
            attachment: attachment.value,
            description: description.value.trim(),
            issueType: issueType.value,
        });

        supportStore.clearDraft();
        await refreshRecords();
    } finally {
        isSubmitting.value = false;
    }
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
        padding: 0 var(--corner-2);
    }

    &__field {
        display: flex;
        flex-direction: column;
        gap: var(--corner-2);

        // 描述框固定高，不跟著彈窗長高
        &--grow {
            flex: none;
        }
    }

    // 標題字：兩個主題都是白，用 Neutral/10 不用 Primary/10（淺色會變深藍）
    &__label {
        font-size: var(--font-size-18);
        font-weight: var(--font-weight-medium);
        color: var(--color-neutral-10);
    }

    // 星號跟標題同色，不要紅色
    &__required {
        color: inherit;
    }

    &__textarea {
        flex: none;
        height: 150px;
    }

    // 尺寸由 BaseButton 自己管（H5 150 x 40、PC 200 x 46），這裡只管擺哪裡
    &__submit {
        align-self: center;
        margin-top: var(--corner-4);
    }

    @media (width >= 600px) {
        &__label {
            font-size: var(--font-size-20);
        }

        &__textarea {
            height: 200px;
        }
    }
}
</style>
