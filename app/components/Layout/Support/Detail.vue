<template>
    <div class="support-detail">
        <div class="support-detail__card">
            <p class="support-detail__date">
                {{ record.createdAt }}
            </p>
            <div class="support-detail__question">
                <h3 class="support-detail__type">
                    {{ $t(toShortIssueKey(record.issueTypeKey)) }}
                </h3>
                <p class="support-detail__text">
                    {{ record.description }}
                </p>
            </div>

            <div
                v-if="record.reply"
                class="support-detail__reply"
            >
                <div class="support-detail__reply-head">
                    <h4 class="support-detail__reply-title">
                        {{ $t('support.reply') }}
                    </h4>
                    <span class="support-detail__reply-time">{{ record.reply.repliedAt }}</span>
                </div>

                <p class="support-detail__reply-text">
                    {{ record.reply.content }}
                </p>
            </div>
        </div>

        <div class="support-detail__foot">
            <div class="support-detail__actions">
                <BaseButton
                    class="support-detail__action"
                    variant="secondary"
                    @click="closeRecord"
                >
                    {{ $t('support.back') }}
                </BaseButton>

                <BaseButton
                    class="support-detail__action"
                    @click="askAgain(toIssueTypeValue(record.issueTypeKey))"
                >
                    {{ $t('support.askAgain') }}
                </BaseButton>
            </div>

            <p class="support-detail__note">
                {{ $t('support.autoCloseNote') }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">
import {
    toIssueTypeValue,
    toShortIssueKey,
} from '@/libs/support';
import type { SupportRecord } from '@/types/support';

// Define props, models and emits
defineProps<{ record: SupportRecord }>();

const {
    askAgain,
    closeRecord,
} = useSupportStore();
</script>

<style scoped lang="scss">
.support-detail {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 40px; // 按鈕區還是靠 margin-top: auto 推到最底

    min-height: 0;

    // 高度依內容，不要撐滿——撐滿的話回覆下面會留一大塊空的深藍底
    &__card {
        overflow-y: auto;
        display: flex;
        flex: 0 1 auto;
        flex-direction: column;
        gap: var(--corner-2);

        min-height: 0;
        padding: var(--corner-2) var(--corner-3);
        border-radius: var(--corner-2);

        background: var(--bg-support-card);
    }

    &__date {
        margin: 0;
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-40);
    }

    &__question {
        display: flex;
        flex-direction: column;
        gap: var(--corner-2);
    }

    &__type {
        margin: 0;
        font-size: var(--font-size-18);
        font-weight: var(--font-weight-medium);
        color: var(--color-neutral-10);
    }

    &__text {
        margin: 0;

        font-size: var(--font-size-18);
        font-weight: var(--font-weight-regular);
        color: var(--color-neutral-20);
        text-align: justify;
    }

    &__reply {
        display: flex;
        flex-direction: column;
        gap: var(--corner-2);

        padding: var(--corner-2);
        border-radius: var(--corner-2);

        background: var(--bg-support-reply);
    }

    &__reply-head {
        display: flex;
        gap: var(--corner-2);
        align-items: baseline;
        justify-content: space-between;
    }

    &__reply-title {
        margin: 0;
        font-size: var(--font-size-18);
        font-weight: var(--font-weight-medium);
        color: var(--color-support-reply-title);
    }

    &__reply-time {
        font-size: var(--font-size-16);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-20);
    }

    // 客服打的內容有換行，要保留
    &__reply-text {
        margin: 0;

        font-size: var(--font-size-18);
        font-weight: var(--font-weight-regular);
        color: var(--color-support-reply-text);
        text-align: justify;
        white-space: pre-line;
    }

    // 按鈕與說明推到彈窗最底，中間的空白留白就好
    &__foot {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: var(--corner-2);
        align-items: center;

        margin-top: auto;
    }

    &__actions {
        display: flex;
        gap: var(--corner-4);
        justify-content: center;
        width: 100%;
    }

    // 手機：兩顆並排、字不換行、寬度跟著字走、間距固定 20
    // 先各佔 150，放不下就一起縮，但最窄只縮到「字＋左右內距」（max-content），不會斷行
    &__action {
        @media (width < 600px) {
            flex: 0 1 var(--button-medium-width);
            min-width: max-content;
            white-space: nowrap;
        }
    }

    &__note {
        margin: 0;

        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-40);
        text-align: center;
    }

    // 電腦版字級
    @media (width >= 600px) {
        &__card {
            gap: var(--corner-3);
        }

        &__actions {
            gap: var(--corner-5);
        }

        &__date {
            font-size: var(--font-size-16);
        }

        &__reply-time {
            font-size: var(--font-size-18);
        }

        &__note {
            font-size: var(--font-size-16);
        }

        &__type,
        &__text,
        &__reply-title,
        &__reply-text {
            font-size: var(--font-size-20);
        }
    }
}
</style>
