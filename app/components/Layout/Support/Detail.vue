<template>
    <div class="support-detail">
        <!-- Figma Frame 11：整張卡跟列表卡同一套底色 -->
        <div class="support-detail__card">
            <p class="support-detail__date">
                {{ record.createdAt }}
            </p>
            <h3 class="support-detail__type">
                {{ $t(toShortIssueKey(record.issueTypeKey)) }}
            </h3>
            <p class="support-detail__text">
                {{ record.description }}
            </p>

            <!-- Figma Frame 1570：客服回覆的氣泡，底色比外層淺一階 -->
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
                    variant="secondary"
                    @click="closeRecord"
                >
                    {{ $t('support.back') }}
                </BaseButton>

                <BaseButton @click="askAgain(toIssueTypeValue(record.issueTypeKey))">
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
    gap: var(--corner-3);

    min-height: 0;

    // Figma Frame 11：圓角 Corner-2、內距 上下 Corner-2／左右 Corner-3、間距 15
    // 高度依內容，不要撐滿——撐滿的話回覆下面會留一大塊空的深藍底（她 2026-09-11 指出）
    &__card {
        overflow-y: auto;
        display: flex;
        flex: 0 1 auto;
        flex-direction: column;
        gap: var(--corner-1);

        min-height: 0;
        padding: var(--corner-2) var(--corner-3);
        border-radius: var(--corner-2);

        background: var(--bg-support-card);
    }

    // Figma：14 / 300 / Primary/40
    &__date {
        margin: 0;

        font-size: 14px;
        font-weight: 300;
        line-height: 1.4;
        color: var(--color-primary-40);
    }

    &__type {
        margin: 0;

        font-size: 18px;
        font-weight: 500;
        line-height: 1.4;
        color: var(--color-neutral-10);
    }

    // Figma Color/Neutral/20
    &__text {
        margin: 0;

        font-size: 16px;
        font-weight: 300;
        line-height: 1.4;
        color: var(--color-neutral-20);
    }

    // Figma Frame 1570：圓角 Corner-2、內距 Corner-2、間距 10
    &__reply {
        display: flex;
        flex-direction: column;
        gap: var(--corner-2);

        margin-top: var(--corner-3);
        padding: var(--corner-2);
        border-radius: var(--corner-2);

        background: var(--color-primary-50);
    }

    &__reply-head {
        display: flex;
        gap: var(--corner-2);
        align-items: baseline;
        justify-content: space-between;
    }

    &__reply-title {
        margin: 0;

        font-size: 18px;
        font-weight: 500;
        line-height: 1.4;
        color: var(--color-neutral-10);
    }

    &__reply-time {
        font-size: 14px;
        font-weight: 300;
        line-height: 1.4;
        color: var(--color-primary-20);
    }

    // 客服打的內容有換行，要保留
    &__reply-text {
        margin: 0;

        font-size: 16px;
        font-weight: 300;
        line-height: 1.4;
        color: var(--color-neutral-10);
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

    &__actions {
        display: flex;
        gap: var(--corner-2);
        justify-content: center;
        width: 100%;
    }

    // Figma：PC 16（她 2026-09-11 給值）。⚠️ H5 字級與顏色暫定
    &__note {
        margin: 0;

        font-size: 12px;
        font-weight: 300;
        line-height: 1.4;
        color: var(--color-primary-40);
        text-align: center;
    }

    // 電腦版字級（她 2026-09-11 逐項指定）
    @media (width >= 600px) {
        &__date {
            font-size: 16px;
        }

        &__reply-time {
            font-size: 18px;
        }

        &__note {
            font-size: 16px;
        }

        &__type,
        &__text,
        &__reply-title,
        &__reply-text {
            font-size: 20px;
        }
    }
}
</style>
