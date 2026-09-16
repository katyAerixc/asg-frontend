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
                    <GameTag
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

                <!-- 三格數據跟遊戲卡共用 GameStat，只換 variant -->
                <div class="game-detail__stats">
                    <GameStat
                        :label="$t('lobby.card.volatilityLabel')"
                        :value="$t(`lobby.volatility.${game.volatility}`)"
                        variant="detail"
                    />
                    <GameStat
                        highlight
                        label="RTP"
                        :trend="game.rtpTrend"
                        :value="game.rtp"
                        variant="detail"
                    />
                    <GameStat
                        :label="$t('lobby.card.maxMultiplier')"
                        :value="game.maxMultiplier"
                        variant="detail"
                    />
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
defineProps<{ game: Game }>();

// Variables
const { close: closeGameDetail } = useGameDetailStore();

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

        font-size: var(--font-size-24);
        font-weight: var(--font-weight-bold);
        line-height: 1.4;
        color: var(--color-neutral-10);
    }

    // Figma Frame 10856：圓角 full、1px Semantic/red-10、內距 Corner-1／Corner-2
    &__category {
        display: flex;
        flex-shrink: 0;
        align-items: center;

        min-height: 25px;
        padding: 0 var(--corner-2);
        border: 1px solid var(--color-red-10);
        border-radius: var(--corner-full);

        font-size: var(--font-size-12);
        font-weight: var(--font-weight-medium);
        color: var(--color-red-10);
    }

    // Figma：H5 14 / PC 16，300，Neutral/20
    &__desc {
        margin: 0;

        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        line-height: 1.4;
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
        // 深色：border-image 漸層蓋掉框色；淺色：border-image 是 none，顯示 White/50 實線
        border-top: 1px solid var(--color-white-50);
        border-image: var(--line-game-detail-stats);
    }

    // 字級先跟著換（Figma PC 值）
    @media (width >= 600px) {
        &__name {
            font-size: var(--font-size-26);
        }

        &__category {
            min-height: 27px;
            font-size: var(--font-size-14);
        }

        &__desc {
            font-size: var(--font-size-16);
        }
    }

    // 圖在左、文字在右：等空間夠放得下 360 的圖 + 三格才切換
    // （彈窗 PC 是 765 寬，低於 768 擠不下，會把三格壓到看不見字）
    @media (width >= 768px) {
        flex-direction: row;
        gap: var(--corner-3); // Figma Frame 11321：主圖 → 右欄 15

        &__media {
            width: 360px;
            height: 300px;
        }
    }
}
</style>
