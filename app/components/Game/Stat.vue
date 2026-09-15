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

        font-weight: var(--font-weight-regular);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__value {
        display: inline-flex;
        align-items: center;

        max-width: 100%;

        font-weight: var(--font-weight-bold);
        white-space: nowrap;
    }

    // 箭頭圖示左右本身有透明空白（SVG 路徑只畫在 5.5～15.5／22：左 25%、右 29.5%）
    // 左邊拉回再留 4px，數字和箭頭才會靠在一起（她 2026-09-15 要求 4px）；右邊也拉回，整組置中才不會偏左
    // 尺寸統一寫在 --stat-arrow-size
    &__arrow {
        flex-shrink: 0;

        width: var(--stat-arrow-size);
        height: var(--stat-arrow-size);
        margin-right: calc(var(--stat-arrow-size) * -0.295);
        margin-left: calc(var(--stat-arrow-size) * -0.25 + 4px);
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
        // 數字與箭頭之間不留 gap（她 2026-09-15 要靠在一起，間距改由箭頭的 margin 控制）
        // 不裁切（她 2026-09-15 指定拿掉 overflow: hidden）：數字＋箭頭已經會自己縮到塞得下
        #{$self}__value {
            gap: 0;
            min-width: 0;
            font-size: clamp(13px, 10.8cqw, 18px);
            color: var(--color-primary-10);

            // 電腦：字級已由上方的 clamp 接手（14 / 18），這裡只剩字重不同
            @media (width >= 960px) {
                font-weight: var(--font-weight-medium);
            }
        }

        // 25px 是上限（375 以上就是 25）；比 375 窄才等比例縮，320 時約 20.8px
        #{$self}__arrow {
            --stat-arrow-size: clamp(16px, 15.1cqw, 25px);
        }

        // 電腦版卡片變窄（約 960～1140）時，「數字＋箭頭」(97px) 塞不下、箭頭被切（她 2026-09-15）
        // 數字和箭頭一起等比例縮（她說只縮字會太小）：字最大 18、箭頭最大 25，塞不下才縮
        // 算法：一格寬 ≈ 卡片寬 31.5% − 9.5px；扣掉左右各留 4＋間距 4，剩下給「字(3.78 倍字級)＋箭頭實際佔的寬(0.63 倍字級)」
        @media (width >= 960px) {
            &#{$self}--up,
            &#{$self}--down {
                #{$self}__value {
                    font-size: clamp(13px, calc(7.14cqw - 4.88px), 18px);
                }

                #{$self}__arrow {
                    --stat-arrow-size: clamp(18px, calc(9.92cqw - 6.77px), 25px);
                }
            }
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
            // 「數字＋箭頭」比格子寬時箭頭會凸出右邊（她 2026-09-15 抓到，320 凸 22px、1280 凸 4px）
            // ①內距維持 15（改小會讓這格比旁邊兩格窄），但數字可以置中「吃進」左右內距各 11，邊邊還留 4
            // ②還是塞不下才讓數字＋箭頭一起等比例縮（跟遊戲卡同一套）；cqw 看的是這一格扣掉內距的寬
            container-type: inline-size;
            background: var(--game-stat-trend);

            // 字寬 3.78 倍字級＋箭頭實際佔 0.63 倍字級＋間距 4px＋保留 2px ＝ 內容寬＋吃進內距的 22px
            #{$self}__value {
                max-width: none;
                font-size: clamp(12px, calc(22.68cqw + 3.63px), 16px);
            }

            #{$self}__arrow {
                --stat-arrow-size: clamp(16px, calc(31.5cqw + 5.04px), 22px);
            }

            @media (width >= 600px) {
                #{$self}__value {
                    font-size: clamp(12px, calc(22.68cqw + 3.63px), 18px);
                }

                #{$self}__arrow {
                    --stat-arrow-size: clamp(16px, calc(31.5cqw + 5.04px), 25px);
                }
            }
        }

        // Figma：H5 12 / PC 14，300，Neutral/10
        #{$self}__label {
            font-size: var(--font-size-12);
            color: var(--color-neutral-10);
        }

        // Figma：H5 16 / 700，PC 18 / 500
        #{$self}__value {
            gap: 0;
            font-size: var(--font-size-16);
            color: var(--color-neutral-10);
        }

        // 箭頭要比字大一點才看得出漲跌（比例照遊戲卡那顆：H5 22、PC 25）
        #{$self}__arrow {
            --stat-arrow-size: 22px;

            color: currentcolor;
            background-color: currentcolor;
        }

        @media (width >= 600px) {
            min-height: 51px;

            #{$self}__label {
                font-size: var(--font-size-14);
            }

            #{$self}__value {
                font-size: var(--font-size-18);
                font-weight: var(--font-weight-medium);
            }

            #{$self}__arrow {
                --stat-arrow-size: 25px;
            }
        }
    }
}
</style>
