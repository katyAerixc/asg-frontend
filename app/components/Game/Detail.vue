<template>
    <BaseModal
        gap="30px"
        gap-pc="60px"
        height="650px"
        height-pc="auto"
        width-pc="765px"
        :title="$t('lobby.detail.title')"
        @close="closeGameDetail"
    >
        <div class="game-detail">
            <div class="game-detail__media">
                <img
                    class="game-detail__img"
                    :alt="game.name"
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

                <div class="game-detail__stats">
                    <GameStat
                        variant="detail"
                        :label="$t('lobby.card.volatilityLabel')"
                        :value="$t(`lobby.volatility.${game.volatility}`)"
                    />
                    <GameStat
                        label="RTP"
                        variant="detail"
                        :trend="game.rtpTrend"
                        :value="game.rtp"
                        highlight
                    />
                    <GameStat
                        variant="detail"
                        :label="$t('lobby.card.maxMultiplier')"
                        :value="game.maxMultiplier"
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
const props = defineProps<{ game: Game }>();

// Variables
const localePath = useLocalePath();
const { close: closeGameDetail } = useGameDetailStore();

// Functions
function play() {
    closeGameDetail();
    navigateTo(localePath(`/game/${props.game.id}`));
}
</script>

<style scoped lang="scss">
.game-detail {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: var(--corner-3);

    min-height: 0;

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

    // 只有說明文字會捲，名稱與三格固定不動
    &__body {
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

    &__name {
        margin: 0;
        font-size: var(--font-size-24);
        font-weight: var(--font-weight-bold);
        color: var(--color-neutral-10);
    }

    &__category {
        display: flex;
        flex-shrink: 0;
        align-items: center;

        min-height: 25px;
        padding: var(--corner-1) var(--corner-2);
        border: 1px solid var(--color-semantic-red-10);
        border-radius: var(--corner-full);

        font-size: var(--font-size-12);
        font-weight: var(--font-weight-medium);
        color: var(--color-semantic-red-10);
    }

    // 文字太多時可以滑，但不顯示捲軸；捲到底不帶動後面的頁面
    &__desc {
        scrollbar-width: none;

        overflow-y: auto;
        overscroll-behavior: contain;
        flex: 1;

        min-height: 0;
        margin: 0;

        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--color-neutral-20);
        text-align: justify;

        &::-webkit-scrollbar {
            display: none;
        }
    }

    &__stats {
        display: flex;
        flex-shrink: 0;
        gap: 10px;

        margin-top: auto;
        padding-top: var(--corner-2);

        // Game1 那區與三格之間的分隔線
        // 深色：border-image 漸層蓋掉框色；淺色：border-image 是 none，顯示 White/50 實線
        border-top: 1px solid var(--color-white-50);
        border-image: var(--line-game-detail-stats);
    }

    // 字級先跟著換
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
        gap: var(--corner-3);

        &__media {
            width: 360px;
            height: 300px;
        }

        // 右欄跟圖一樣高，文字再多也不會把彈窗撐高
        &__body {
            height: 300px;
        }
    }
}
</style>
