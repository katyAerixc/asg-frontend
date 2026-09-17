<template>
    <div class="support-detail">
        <div class="support-detail__card">
            <p class="support-detail__date">
                {{ record.createdAt }}
            </p>
            <!-- Figma Frame 1568：類型與描述自成一組，組內間距 10 -->
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
    gap: 40px; // Figma 彈窗 gap 40：內容 → 按鈕區（按鈕區還是 margin-top: auto 推到最底）

    min-height: 0;

    // Figma Frame 11：圓角 Corner-2、內距 上下 Corner-2／左右 Corner-3、間距 手機 10／電腦 15
    // 高度依內容，不要撐滿——撐滿的話回覆下面會留一大塊空的深藍底（她 2026-09-11 指出）
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

    // Figma：14 / 300 / Primary/40（她 2026-09-17 說照 Figma，取代 09-14 的 Primary/50）
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

    // Figma Color/Neutral/20；H5 18 / PC 20
    &__text {
        margin: 0;

        font-size: var(--font-size-18);
        font-weight: var(--font-weight-regular);
        color: var(--color-neutral-20);
        text-align: justify;
    }

    // Figma Frame 1570：圓角 Corner-2、內距 Corner-2、間距 10
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

    // Figma：H5 16 / PC 18
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

    // 按鈕與說明推到彈窗最底（她 2026-09-11 指定），中間的空白留白就好
    &__foot {
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: var(--corner-2);
        align-items: center;

        margin-top: auto;
    }

    // Figma Frame 11205：兩顆按鈕間距 手機 20／電腦 30
    &__actions {
        display: flex;
        gap: var(--corner-4);
        justify-content: center;
        width: 100%;
    }

    // 手機：兩顆並排、字不換行、寬度跟著字走、間距固定 20（她 2026-09-17 給範例圖，取代原本「窄時上下疊」）
    // 先各佔 Figma 的 150，放不下就一起縮，但最窄只縮到「字＋左右內距」（max-content），不會斷行
    &__action {
        @media (width < 600px) {
            flex: 0 1 var(--button-medium-width);
            min-width: max-content;
            white-space: nowrap;
        }
    }

    // Figma：H5 14 / PC 16（PC 她 2026-09-11 給值）、Primary/40
    &__note {
        margin: 0;

        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-40);
        text-align: center;
    }

    // 電腦版字級（她 2026-09-11 逐項指定）
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
