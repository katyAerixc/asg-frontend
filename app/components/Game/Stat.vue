<template>
    <div
        class="game-stat"
        :class="[
            `game-stat--${variant}`,
            {
                'game-stat--highlight': highlight,
                [`game-stat--${trend}`]: trend,
            },
        ]"
    >
        <span class="game-stat__label">{{ label }}</span>
        <span class="game-stat__value">
            {{ value }}
            <!-- 🚨 圖示 class 要寫完整的字，不能用 `i-sp-trend-${trend}` 組：
                 UnoCSS 是掃原始碼找字串來產生 CSS，組出來的它看不到，箭頭就會消失（2026-09-14 她抓到） -->
            <span
                v-if="trend"
                class="game-stat__arrow"
                :class="{
                    'i-sp-trend-down': trend === 'down',
                    'i-sp-trend-up': trend === 'up',
                }"
            />
        </span>
    </div>
</template>

<script setup lang="ts">
import type { Game } from '@/types/game';

// Define props, models and emits
// 遊戲卡與遊戲介紹彈窗共用的「一格數據」（波動度／RTP／最高賠率）
// 結構與紅綠漸層只寫一次；尺寸、字色照 Figma 兩邊各自的值，用 variant 切換（她 2026-09-14 定）
withDefaults(
    defineProps<{
        // 主角格（RTP）：卡片版會呼吸、手機只留這一格
        highlight?: boolean;
        label: string;
        // 紅＝漲 up ↗、綠＝跌 down ↘（亞洲習慣）；有值才出現箭頭
        trend?: Game['rtpTrend'];
        value: string;
        variant: 'card' | 'detail';
    }>(),
    {
        highlight: false,
        trend: null,
    },
);
</script>

<style scoped lang="scss">
// RTP 那格的呼吸感：2 秒一次來回，最大放到 1.06 倍（她 2026-09-09 說 1.03 太小）
@keyframes rtp-breathe {
    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.06);
    }
}

.game-stat {
    // 指回 .game-stat 自己：variant 裡要組合「同一格的其他狀態」時用（stylelint 不准直接寫完整 class 名）
    $self: &;

    // ── 兩邊共用 ────────────────────────────────────────────
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    align-items: center;

    min-width: 0; // 允許被壓縮，裡面的文字才切得掉（不加的話會把外框撐開）
    border-radius: var(--corner-2);

    background: var(--color-primary-opacity-6010);

    // 漲跌的漸層只定義在這裡（Figma Rectangle 616：60% → 20%）
    // 要畫在哪一層由下面兩個 variant 決定：卡片畫在會呼吸的 ::before、彈窗畫在本體
    &--up {
        --game-stat-trend: linear-gradient(
            293deg,
            var(--color-red-opacity-2060) 35.34%,
            var(--color-red-opacity-2020) 100%
        );
    }

    &--down {
        --game-stat-trend: linear-gradient(
            293deg,
            var(--color-green-opacity-2060) 35.34%,
            var(--color-green-opacity-2020) 100%
        );
    }

    // 多語系：字太長時切掉加「…」，不換行也不把外框撐高
    &__label {
        overflow: hidden;

        max-width: 100%;

        font-weight: 300;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__value {
        display: inline-flex;
        align-items: center;

        max-width: 100%;

        font-weight: 700;
        white-space: nowrap;
    }

    &__arrow {
        flex-shrink: 0;
    }

    // ── 遊戲卡：字級跟著卡片寬度縮放（cqw），斷點 960 ────────────
    &--card {
        padding: 4px 0;

        // 手機版只留主角格（RTP）
        &:not(#{$self}--highlight) {
            display: none;

            @media (width >= 960px) {
                display: flex;
            }
        }

        // 主角格：背景搬到 ::before 這層，只讓背景呼吸，文字與箭頭不動
        &#{$self}--highlight {
            position: relative;
            z-index: 0;

            flex-direction: row;
            justify-content: center;

            // 左右只留 4px：手機上這格要塞「RTP + 數值 + 箭頭」，內距太寬會把文字擠掉
            padding: 4px;

            background: none;

            // 這層就是「會呼吸的背景」，躲在文字後面（z-index: -1）
            &::before {
                content: '';

                position: absolute;
                z-index: -1;
                inset: 0;

                border-radius: inherit;

                background: var(--color-primary-opacity-6010);

                animation: rtp-breathe 2s ease-in-out infinite;
            }

            @media (width >= 960px) {
                flex-direction: column;
                padding: 4px 0;
            }

            // 使用者若在系統開了「減少動態效果」，一律不動（W3C 無障礙要求）
            @media (prefers-reduced-motion: reduce) {
                &::before {
                    animation: none;
                }
            }
        }

        // 漲跌的顏色也要畫在 ::before 那層，才會跟著呼吸
        &#{$self}--up::before,
        &#{$self}--down::before {
            background: var(--game-stat-trend);
            box-shadow: 0 0 10px 0 var(--shadow-dark-20);
        }

        // 14px 是上限（375 以上就是 14）；比 375 窄才等比例縮，320 時約 11.6px
        #{$self}__label {
            font-size: clamp(10px, 8.4cqw, 14px);
            color: var(--color-primary-20);
        }

        // 18px 是上限（375 以上就是 18）；比 375 窄才等比例縮，320 時約 14.9px
        #{$self}__value {
            overflow: hidden;
            gap: 4px;

            min-width: 0;

            font-size: clamp(13px, 10.8cqw, 18px);
            color: var(--color-primary-10);

            // 320 這種極窄畫面：數值與箭頭之間不留間距，把那 4px 讓給文字（她 2026-09-10 定）
            @media (width < 375px) {
                gap: 0;
            }

            // 電腦：字級已由上方的 clamp 接手（14 / 18），這裡只剩字重不同
            @media (width >= 960px) {
                font-weight: 500;
            }
        }

        // 25px 是上限（375 以上就是 25）；比 375 窄才等比例縮，320 時約 20.8px
        #{$self}__arrow {
            width: clamp(16px, 15.1cqw, 25px);
            height: clamp(16px, 15.1cqw, 25px);
        }
    }

    // ── 遊戲介紹彈窗：固定字級，斷點 600 ────────────────────────
    // Figma PC/Game/block：圓角 Corner-2、間距 4、底 Primary/60 10%
    &--detail {
        position: relative;
        z-index: 0;

        justify-content: center;

        // Figma：H5 高 46、PC 高 51。用 min-height 而不是寫死高度——
        // 其他語言的「最高賠率」比中文長，需要時讓它自己長高，不要把字裁掉
        min-height: 46px;

        // 上下不要 padding：行高放寬後光是兩行文字就有 46，再加內距會超過設計稿
        padding: 0 var(--corner-3);

        // 漲跌那格直接換成紅／綠漸層
        &#{$self}--up,
        &#{$self}--down {
            background: var(--game-stat-trend);
        }

        // Figma：H5 12 / PC 14，300，Neutral/10
        #{$self}__label {
            font-size: 12px;
            color: var(--color-neutral-10);
        }

        // Figma：H5 16 / 700，PC 18 / 500
        #{$self}__value {
            gap: 0;
            font-size: 16px;
            color: var(--color-neutral-10);
        }

        // 箭頭要比字大一點才看得出漲跌（比例照遊戲卡那顆：H5 22、PC 25）
        #{$self}__arrow {
            width: 22px;
            height: 22px;
            color: currentcolor;
            background-color: currentcolor;
        }

        @media (width >= 600px) {
            min-height: 51px;

            #{$self}__label {
                font-size: 14px;
            }

            #{$self}__value {
                font-size: 18px;
                font-weight: 500;
            }

            #{$self}__arrow {
                width: 25px;
                height: 25px;
            }
        }
    }
}
</style>
