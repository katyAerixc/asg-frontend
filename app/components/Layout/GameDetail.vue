<template>
    <BaseModal
        gap="30px"
        gap-pc="60px"
        height="650px"
        height-pc="auto"
        :title="$t('lobby.detail.title')"
        width-pc="765px"
        @close="closeGameDetail"
    >
        <div class="game-detail">
            <!-- 主圖：手機在上、電腦在左 -->
            <div class="game-detail__media">
                <img
                    :alt="game.name"
                    class="game-detail__img"
                    :src="game.image"
                >

                <div
                    v-if="game.tags.length"
                    class="game-detail__tags"
                >
                    <BaseTag
                        v-for="tag in game.tags"
                        :key="tag"
                        :type="tag"
                    />
                </div>
            </div>

            <div class="game-detail__body">
                <div class="game-detail__head">
                    <h3 class="game-detail__name">
                        {{ game.name }}
                    </h3>
                    <span class="game-detail__category">{{ $t(`lobby.category.${game.category}`) }}</span>
                </div>

                <p class="game-detail__desc">
                    {{ game.description }}
                </p>

                <div class="game-detail__stats">
                    <div class="game-detail__stat">
                        <span class="game-detail__stat-label">{{ $t('lobby.card.volatilityLabel') }}</span>
                        <span class="game-detail__stat-value">{{ $t(`lobby.volatility.${game.volatility}`) }}</span>
                    </div>

                    <div
                        class="game-detail__stat"
                        :class="rtpClass"
                    >
                        <span class="game-detail__stat-label">RTP</span>
                        <span class="game-detail__stat-value">
                            {{ game.rtp }}
                            <span
                                v-if="game.rtpTrend"
                                class="game-detail__arrow"
                                :class="`i-sp-trend-${game.rtpTrend}`"
                            />
                        </span>
                    </div>

                    <div class="game-detail__stat">
                        <span class="game-detail__stat-label">{{ $t('lobby.card.maxMultiplier') }}</span>
                        <span class="game-detail__stat-value">{{ game.maxMultiplier }}</span>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <BaseButton
                size="large"
                variant="highlight"
                @click="play"
            >
                {{ $t('lobby.detail.play') }}
            </BaseButton>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
import type { Game } from '@/types/game';

// Define props, models and emits
const props = defineProps<{ game: Game }>();

// Variables
const { closeGameDetail } = useGameDetail();

// Computed properties
// 紅＝漲 up ↗、綠＝跌 down ↘（亞洲習慣），跟遊戲卡同一套
const rtpClass = computed(() => ({
    'game-detail__stat--down': props.game.rtpTrend === 'down',
    'game-detail__stat--up': props.game.rtpTrend === 'up',
}));

// Functions
// ⚠️ 遊戲畫面那一頁還沒做，先只把彈窗關掉（她 2026-09-11：點了要跳到遊戲畫面）
function play() {
    closeGameDetail();
}
</script>

<style scoped lang="scss">
// 全部數值來自 Figma 屬性面板（她 2026-09-11 提供 34 張截圖）
.game-detail {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--corner-3);

    min-height: 0;

    // Figma：H5 330 x 225、PC 360 x 300、圓角 Corner-4
    &__media {
        position: relative;
        flex-shrink: 0;
        height: 225px;
        border-radius: var(--corner-4);
    }

    &__img {
        display: block;

        width: 100%;
        height: 100%;
        border-radius: inherit;

        object-fit: cover;
    }

    // 標籤疊在圖片左上角，留一點白不要貼邊（跟遊戲卡同一個內縮值）
    &__tags {
        position: absolute;
        top: var(--corner-1);
        left: var(--corner-1);

        display: flex;
        gap: 4px;
    }

    &__body {
        overflow-y: auto;
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-2);

        // 橫排時要能被壓縮，裡面的文字才切得掉（不加會把彈窗撐出橫向捲軸）
        min-width: 0;
        min-height: 0;
    }

    &__head {
        display: flex;
        flex-wrap: wrap;
        gap: var(--corner-2);
        align-items: center;
    }

    // Figma：H5 24 / PC 26，都是 700
    &__name {
        margin: 0;

        font-size: 24px;
        font-weight: 700;
        line-height: 140%;
        color: var(--color-neutral-10);
    }

    // Figma Frame 10856：圓角 full、1px Semantic/red-10、內距 Corner-1／Corner-2
    &__category {
        flex-shrink: 0;

        padding: var(--corner-1) var(--corner-2);
        border: 1px solid var(--color-red-10);
        border-radius: var(--corner-full);

        font-size: 12px;
        font-weight: 500;
        line-height: 100%;
        color: var(--color-red-10);
    }

    // Figma：H5 14 / PC 16，300，Neutral/20
    &__desc {
        margin: 0;

        font-size: 14px;
        font-weight: 300;
        line-height: 140%;
        color: var(--color-neutral-20);
    }

    // 三格之間留 10（照設計稿比例）
    &__stats {
        display: flex;
        flex-shrink: 0;
        gap: 10px;

        margin-top: auto;
        padding-top: var(--corner-3);

        // Game1 那區與三格之間的分隔線
        border-top: 1px solid;
        border-image: var(--line-popup) 1;
    }

    // Figma PC/Game/block：圓角 Corner-2、上下內距 Corner-1、間距 4、底 Primary/60 10%
    &__stat {
        position: relative;
        z-index: 0;

        display: flex;
        flex: 1;
        flex-direction: column;
        gap: 4px;
        align-items: center;
        justify-content: center;

        min-width: 0;

        // Figma：H5 高 46、PC 高 51。用 min-height 而不是寫死高度——
        // 其他語言的「最高賠率」比中文長，需要時讓它自己長高，不要把字裁掉
        min-height: 46px;
        padding: var(--corner-1) var(--corner-3);
        border-radius: var(--corner-2);

        background: var(--color-primary-opacity-6010);

        // 漲跌那格換成紅／綠漸層（Figma Rectangle 616：60% → 20%）
        &--up {
            background: linear-gradient(
                293deg,
                var(--color-red-opacity-2060) 35.34%,
                var(--color-red-opacity-2020) 100%
            );
        }

        &--down {
            background: linear-gradient(
                293deg,
                var(--color-green-opacity-2060) 35.34%,
                var(--color-green-opacity-2020) 100%
            );
        }
    }

    // Figma：H5 12 / PC 14，300，Neutral/10
    &__stat-label {
        overflow: hidden;

        max-width: 100%;

        font-size: 12px;
        font-weight: 300;
        line-height: 100%;
        color: var(--color-neutral-10);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // Figma：H5 16 / 700，PC 18 / 500
    &__stat-value {
        display: inline-flex;
        gap: 4px;
        align-items: center;

        max-width: 100%;

        font-size: 16px;
        font-weight: 700;
        line-height: 100%;
        color: var(--color-neutral-10);
        white-space: nowrap;
    }

    // 箭頭要比字大一點才看得出漲跌（比例照遊戲卡那顆：H5 22、PC 25）
    &__arrow {
        flex-shrink: 0;

        width: 22px;
        height: 22px;

        color: currentcolor;

        background-color: currentcolor;
    }

    // 字級先跟著換（Figma PC 值）
    @media (width >= 600px) {
        &__name {
            font-size: 26px;
        }

        &__category {
            font-size: 14px;
        }

        &__desc {
            font-size: 16px;
        }

        &__stat {
            min-height: 51px;
        }

        &__stat-label {
            font-size: 14px;
        }

        &__stat-value {
            font-size: 18px;
            font-weight: 500;
        }

        &__arrow {
            width: 25px;
            height: 25px;
        }
    }

    // 圖在左、文字在右：等空間夠放得下 360 的圖 + 三格才切換
    // （彈窗 PC 是 765 寬，低於 768 擠不下，會把三格壓到看不見字）
    @media (width >= 768px) {
        flex-direction: row;
        gap: var(--corner-4);

        &__media {
            width: 360px;
            height: 300px;
        }
    }
}
</style>
