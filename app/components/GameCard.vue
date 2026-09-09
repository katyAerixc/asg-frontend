<template>
    <article class="game-card">
        <!-- 大圖區：正方形，比下方玻璃塊窄一點（Figma 360 : 390） -->
        <div class="game-card__media">
            <img
                :alt="game.name"
                class="game-card__img"
                :src="game.image"
            >

            <!-- 標籤（NEW / HOT / HIGH） -->
            <div
                v-if="game.tags.length"
                class="game-card__tags"
            >
                <span
                    v-for="tag in game.tags"
                    :key="tag"
                    class="game-card__tag"
                    :class="`game-card__tag--${tag.toLowerCase()}`"
                >
                    {{ tag }}
                </span>
            </div>
        </div>

        <!-- 玻璃塊 -->
        <div class="game-card__info">
            <div class="game-card__head">
                <img
                    :alt="`${game.name} 縮圖`"
                    class="game-card__thumb"
                    :src="game.image"
                >
                <div class="game-card__text">
                    <!-- 名稱與 ⓘ 同一行，描述才能佔滿整行（到 ⓘ 底下） -->
                    <div class="game-card__name-row">
                        <h3 class="game-card__name">
                            {{ game.name }}
                        </h3>
                        <IconInfo class="game-card__i" />
                    </div>
                    <p class="game-card__desc">
                        {{ game.description }}
                    </p>
                </div>
            </div>

            <hr class="game-card__divider">

            <div class="game-card__stats">
                <div class="game-card__stat">
                    <span class="game-card__stat-label">波動度</span>
                    <span class="game-card__stat-value">{{ game.volatility }}</span>
                </div>
                <div
                    class="game-card__stat game-card__stat--rtp"
                    :class="rtpClass"
                >
                    <span class="game-card__stat-label">RTP</span>
                    <span class="game-card__stat-value">
                        {{ game.rtp }}
                        <IconTrend
                            v-if="game.rtpTrend"
                            class="game-card__arrow"
                            :direction="game.rtpTrend"
                        />
                    </span>
                </div>
                <div class="game-card__stat">
                    <span class="game-card__stat-label">最高賠率</span>
                    <span class="game-card__stat-value">{{ game.maxMultiplier }}</span>
                </div>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import type { Game } from '@/types/game';

const props = defineProps<{ game: Game }>();

// 紅＝漲 up ↗、綠＝跌 down ↘（亞洲習慣）；箭頭圖示交給 IconTrend
const rtpClass = computed(() => ({
    'game-card__stat--down': props.game.rtpTrend === 'down',
    'game-card__stat--up': props.game.rtpTrend === 'up',
}));
</script>

<style scoped lang="scss">
// 屬性順序照 stylelint-config-clean-order：定位 → 排版 → 盒模型 → 文字 → 外觀，群組間空一行
// Figma：卡片 390 × 451、大圖 360×360（1:1）
// 圖比玻璃塊窄，兩側各縮 15px；玻璃塊底部比圖底再往下 91px（451 − 360）
$img-ratio: calc(360 / 390 * 100%);
$below-img: calc(91 / 390 * 100%); // % 的 padding 是以寬度換算，所以能等比縮放

.game-card {
    position: relative;
    padding-bottom: $below-img;

    // 大圖區：置中、比玻璃塊窄
    &__media {
        position: relative;
        width: $img-ratio;
        margin: 0 auto;
    }

    &__img {
        display: block;

        aspect-ratio: 1 / 1; // 大圖是正方形
        width: 100%;
        border-radius: var(--corner-3);

        object-fit: cover;
    }

    // 標籤：距大圖左上角留一點白；左上/右下圓角 15px、白邊、漸層、陰影（照 Figma）
    &__tags {
        position: absolute;
        top: var(--corner-1);
        left: var(--corner-1);

        display: flex;
        gap: 4px;
    }

    &__tag {
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;

        padding: var(--corner-1) var(--corner-2);
        border: 1px solid var(--color-primary-10);
        border-radius: var(--corner-3) 0;

        font-size: 14px; // 手機 14、電腦 16（見下方 media query）
        font-weight: 700;
        color: var(--color-primary-10);
        text-shadow: 0 1px 0 rgb(0 0 0 / 50%);

        box-shadow:
            0 0 10px 0 rgb(0 0 0 / 80%),
            0 -2px 0 0 rgb(0 0 0 / 25%) inset;

        &--new {
            background: linear-gradient(90deg, var(--color-green-20) 0%, var(--color-green-30) 100%);
        }

        &--hot {
            background: linear-gradient(90deg, var(--color-red-20) 0%, var(--color-red-30) 100%);
        }

        &--high {
            background: linear-gradient(90deg, var(--color-yellow-20) 0%, var(--color-yellow-30) 100%);
        }
    }

    // 玻璃塊：滿版寬（比圖寬），疊在大圖下緣，往下多露 20px
    &__info {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;

        display: flex;
        flex-direction: column;
        gap: 10px;

        padding: var(--corner-3);
        border-radius: var(--corner-3);

        background: var(--bg-game);
        backdrop-filter: blur(25px);
        box-shadow: var(--shadow-game);
    }

    &__head {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    // 縮圖：60×60、白邊 1px、圓角 10px（照 Figma）
    &__thumb {
        display: none; // 手機版沒有縮圖
        flex-shrink: 0;

        width: 60px;
        height: 60px;
        border: 1px solid var(--color-primary-10);
        border-radius: var(--corner-2);

        object-fit: cover;
    }

    &__text {
        flex: 1;
        min-width: 0;
    }

    &__name-row {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
    }

    &__name {
        font-size: 18px;
        font-weight: 700;
        color: var(--color-neutral-80);
    }

    &__desc {
        overflow: hidden;

        font-size: 14px;
        font-weight: 300;
        color: var(--color-neutral-80);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__i {
        flex-shrink: 0;
        color: var(--color-neutral-80);
    }

    &__divider {
        display: none; // 手機版沒有分隔線
        height: 1px;
        border: 0;
        background: var(--line-divider);
    }

    // 統計格
    &__stats {
        display: flex;
        gap: 4px;
    }

    &__stat {
        display: none; // 手機版只留 RTP
        flex: 1;
        flex-direction: column;
        gap: 4px;
        align-items: center;

        padding: 4px 0;
        border-radius: var(--corner-2);

        background: var(--color-primary-opacity-6010);

        &--rtp {
            display: flex;
            flex-direction: row;
            justify-content: center;
            padding: 4px 15px;
        }

        &--up {
            background: linear-gradient(
                293deg,
                var(--color-red-opacity-2060) 35.34%,
                var(--color-red-opacity-2020) 100%
            );
            box-shadow: 0 0 10px 0 var(--shadow-dark-20);
        }

        &--down {
            background: linear-gradient(
                293deg,
                var(--color-green-opacity-2060) 35.34%,
                var(--color-green-opacity-2020) 100%
            );
            box-shadow: 0 0 10px 0 var(--shadow-dark-20);
        }
    }

    // 手機：小字 12/300、數值 16/700
    &__stat-label {
        font-size: 12px;
        font-weight: 300;
        color: var(--color-primary-20);
    }

    &__stat-value {
        display: inline-flex;
        gap: 4px;
        align-items: center;

        font-size: 16px;
        font-weight: 700;
        color: var(--color-primary-10);
    }

    &__arrow {
        width: 22px;
        height: 22px;
    }

    // 電腦版
    @media (width >= 768px) {
        &__tag {
            font-size: 16px;
        }

        &__thumb,
        &__divider {
            display: block;
        }

        &__stat {
            display: flex;

            &--rtp {
                flex-direction: column;
                padding: 4px 0;
            }
        }

        // 電腦：小字 14/300、數值 18/500
        &__stat-label {
            font-size: 14px;
        }

        &__stat-value {
            font-size: 18px;
            font-weight: 500;
        }
    }
}
</style>
