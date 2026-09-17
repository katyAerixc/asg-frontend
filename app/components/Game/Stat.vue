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
            <!-- 🚨 圖示 class 要寫完整的字，不能用 `i-sp-trend-${trend}` 組：UnoCSS 掃不到，箭頭會消失 -->
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
// 結構與紅綠漸層只寫一次；卡片與彈窗的尺寸、字色不同，用 variant 切換
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
// RTP 那格的呼吸感（Figma item=up2 ⇄ item=up2_animat）：
// 停 0.2 秒 → 0.6 秒 LINEAR 走完 → 停 0.2 秒 → 0.6 秒回來，一趟 1.6 秒
// 放大的量是「四邊各外擴固定 px」（電腦 3、手機 1），不是等比放大，所以用 inset 不用 scale
@keyframes rtp-breathe {
    0%,
    12.5% {
        inset: 0;
    }

    50%,
    62.5% {
        inset: calc(var(--stat-breathe-out) * -1);
    }

    100% {
        inset: 0;
    }
}

// 箭頭跟著長大：Figma 圖形 10 → 13（電腦）、9.5 → 11（手機）
@keyframes rtp-breathe-arrow {
    0%,
    12.5% {
        transform: scale(1);
    }

    50%,
    62.5% {
        transform: scale(var(--stat-breathe-arrow));
    }

    100% {
        transform: scale(1);
    }
}

.game-stat {
    // 指回 .game-stat 自己：variant 裡要組合「同一格的其他狀態」時用（stylelint 不准直接寫完整 class 名）
    $self: &;

    // 漲跌的漸層只定義在這裡
    // 要畫在哪一層由下面兩個 variant 決定：卡片畫在會呼吸的 ::before、彈窗畫在本體
    // Figma 那條線是「底邊中點 → 左上角」。同一條線放進不同比例的格子，換算成 CSS 的角度與起點就不一樣：
    // 手機格 142 × 27 → 290.8deg 從 46.6% 起；電腦格 112 × 51 → 312.3deg 從 35.3% 起
    --game-stat-trend-angle: 290.8deg;
    --game-stat-trend-start: 46.6%;

    // ── 兩邊共用 ────────────────────────────────────────────
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;
    align-items: center;

    min-width: 0; // 允許被壓縮，裡面的文字才切得掉（不加的話會把外框撐開）
    border-radius: var(--corner-2);

    background: var(--color-primary-opacity-60-10);

    &--up {
        --game-stat-trend: linear-gradient(
            var(--game-stat-trend-angle),
            var(--color-semantic-red-opacity-20-60) var(--game-stat-trend-start),
            var(--color-semantic-red-opacity-20-20) 100%
        );
    }

    &--down {
        --game-stat-trend: linear-gradient(
            var(--game-stat-trend-angle),
            var(--color-semantic-green-opacity-20-60) var(--game-stat-trend-start),
            var(--color-semantic-green-opacity-20-20) 100%
        );
    }

    // 多語系：字太長時切掉加「…」，不換行也不把外框撐高
    &__label {
        // 「…」要裁左右；上下不裁，聲調、泰文上下標才不會被切
        overflow: clip visible;

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
    // 左邊拉回再留 4px，數字和箭頭才會靠在一起；右邊也拉回，整組置中才不會偏左
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
        padding: var(--corner-1) 0;

        // 手機版只留主角格（RTP）
        &:not(#{$self}--highlight) {
            display: none;

            @media (width >= 960px) {
                display: flex;
            }
        }

        // 主角格：背景搬到 ::before 這層，只讓背景呼吸，文字與箭頭不動
        &#{$self}--highlight {
            --stat-breathe-out: 1px;
            --stat-breathe-arrow: 1.156;

            position: relative;
            z-index: 0;

            flex-flow: row wrap;
            justify-content: center;

            // 窄機（<375）左右內距等比縮到最小 4，免得把文字擠掉
            padding: var(--corner-1) clamp(var(--corner-1), 8.72cqw, var(--corner-3));

            background: none;

            // 這層就是「會呼吸的背景」，躲在文字後面（z-index: -1）
            &::before {
                content: '';

                position: absolute;
                z-index: -1;
                inset: 0;

                border-radius: inherit;

                background: var(--color-primary-opacity-60-10);
            }

            #{$self}__arrow {
                animation: rtp-breathe-arrow var(--motion-breathe) infinite;
            }

            @media (width >= 960px) {
                --stat-breathe-out: 3px;
                --stat-breathe-arrow: 1.3;

                flex-direction: column;
                padding: var(--corner-1) 0;
            }

            // 使用者若在系統開了「減少動態效果」，一律不動（W3C 無障礙要求）
            @media (prefers-reduced-motion: reduce) {
                #{$self}__arrow {
                    animation: none;
                }
            }
        }

        // 漲跌的顏色畫在 ::before 那層，跟著呼吸
        // 只有漲／跌有呼吸動畫，沒漲跌的不動
        &#{$self}--up::before,
        &#{$self}--down::before {
            background: var(--game-stat-trend);
            box-shadow: 0 0 10px 0 var(--color-shadow-dark-20);
            animation: rtp-breathe var(--motion-breathe) infinite;

            @media (prefers-reduced-motion: reduce) {
                animation: none;
            }
        }

        // 手機 12 是字級表最小值，不再縮小
        #{$self}__label {
            font-size: var(--font-size-12);
            color: var(--color-primary-20);
        }

        // 比 390 寬（卡片 172）窄才等比例縮
        // 數字與箭頭之間不留 gap（間距改由箭頭的 margin 控制）
        // 不裁切（不加 overflow: hidden）：數字＋箭頭已經會自己縮到塞得下
        #{$self}__value {
            gap: 0;
            min-width: 0;
            font-size: clamp(12px, 9.3cqw, 16px);
            color: var(--color-primary-10);

            @media (width >= 960px) {
                font-size: var(--font-size-18);
                font-weight: var(--font-weight-medium);
            }
        }

        // Figma ic_go；比 390 寬窄才等比例縮
        #{$self}__arrow {
            --stat-arrow-size: clamp(14px, 11.05cqw, 19px);
        }

        // 電腦版卡片變窄（約 960～1140）時，「數字＋箭頭」塞不下、箭頭被切
        // 數字和箭頭一起等比例縮（只縮字會太小），塞不下才縮
        // 算法：一格寬 ≈ 卡片寬 31.5% − 9.5px；扣掉左右各留 4＋間距 4，剩下給「字(3.78 倍字級)＋箭頭實際佔的寬(0.556 倍字級)」
        @media (width >= 960px) {
            --game-stat-trend-angle: 312.3deg;
            --game-stat-trend-start: 35.3%;

            #{$self}__label {
                font-size: var(--font-size-14);
            }

            #{$self}__arrow {
                --stat-arrow-size: 22px;
            }

            &#{$self}--up,
            &#{$self}--down {
                #{$self}__value {
                    font-size: clamp(12px, calc(7.26cqw - 4.96px), 18px);
                }

                #{$self}__arrow {
                    --stat-arrow-size: clamp(16px, calc(8.88cqw - 6.07px), 22px);
                }
            }
        }
    }

    // ── 遊戲介紹彈窗：固定字級，斷點 600 ────────────────────────
    &--detail {
        position: relative;
        z-index: 0;

        // 手機橫排、塞不下就換行；電腦改回直排（見下方 media）
        flex-flow: row wrap;
        place-content: center;

        // 用 min-height 而不是寫死高度——
        // 其他語言的「最高賠率」比中文長，需要時讓它自己長高，不要把字裁掉
        min-height: 46px;
        padding: var(--corner-1) var(--corner-3);

        // 漲跌那格直接換成紅／綠漸層
        &#{$self}--up,
        &#{$self}--down {
            // 「數字＋箭頭」比格子寬時箭頭會凸出右邊
            // ①手機內距維持 15（改小會讓這格比旁邊兩格窄），但數字可以置中「吃進」左右內距各 11，邊邊還留 4；電腦三格都是 0，寬度一樣
            // ②還是塞不下才讓數字＋箭頭一起等比例縮（跟遊戲卡同一套）；cqw 看的是這一格扣掉內距的寬
            container-type: inline-size;
            background: var(--game-stat-trend);

            // 字寬 3.78 倍字級＋箭頭實際佔 0.63 倍字級＋間距 4px＋保留 2px ＝ 內容寬＋吃進內距的 22px
            #{$self}__value {
                max-width: none;
                font-size: clamp(12px, calc(22.68cqw + 3.63px), 16px);
            }

            #{$self}__arrow {
                --stat-arrow-size: clamp(16px, calc(31.5cqw + 5.04px), 19px);
            }

            @media (width >= 600px) {
                #{$self}__value {
                    font-size: clamp(12px, calc(22.68cqw + 3.63px), 18px);
                }

                #{$self}__arrow {
                    --stat-arrow-size: clamp(16px, calc(31.5cqw + 5.04px), 22px);
                }
            }
        }

        #{$self}__label {
            font-size: var(--font-size-12);
            color: var(--color-neutral-10);
        }

        #{$self}__value {
            gap: 0;
            font-size: var(--font-size-16);
            color: var(--color-neutral-10);
        }

        #{$self}__arrow {
            --stat-arrow-size: 19px;

            color: currentcolor;
            background-color: currentcolor;
        }

        @media (width >= 600px) {
            // 電腦格子是 112 × 51，漸層角度與起點跟手機不同（同遊戲卡）
            --game-stat-trend-angle: 312.3deg;
            --game-stat-trend-start: 35.3%;

            flex-direction: column;
            min-height: 51px;
            padding: var(--corner-1) 0;

            #{$self}__label {
                font-size: var(--font-size-14);
            }

            #{$self}__value {
                font-size: var(--font-size-18);
                font-weight: var(--font-weight-medium);
            }

            #{$self}__arrow {
                --stat-arrow-size: 22px;
            }
        }
    }
}
</style>
