<template>
    <div class="game-list">
        <section class="game-list__grid">
            <GameCard
                v-for="game in games"
                :key="game.id"
                :game="game"
            />
        </section>

        <div
            v-if="hasMore"
            class="game-list__more"
        >
            <button
                class="game-list__more-btn"
                type="button"
                @click="emit('loadMore')"
            >
                {{ $t('lobby.loadMore') }}
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { Game } from '@/types/game';

// Define props, models and emits
// 只負責「畫出來」。要顯示哪幾張、還有沒有下一批，由頁面決定——
// 頁數歸零的時機（換分類、標籤才歸零，打字搜尋不歸零）是頁面的規則，不放這裡
defineProps<{
    games: Game[];
    hasMore: boolean;
}>();

const emit = defineEmits<{ loadMore: [] }>();
</script>

<style scoped lang="scss">
.game-list {
    &__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--corner-3) 16px;
    }

    &__more {
        display: flex;
        justify-content: center;
        margin-top: 32px;
    }

    // 寬度不寫死（Hug），多語系文字變長會自己撐開
    &__more-btn {
        cursor: pointer;

        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;

        height: 46px;
        padding: 0 28px;
        border: var(--border-button-primary); // 深色 1px Black/50、淺色沒有
        border-radius: var(--corner-full);

        font-size: var(--font-size-18);
        font-weight: var(--font-weight-medium);
        color: var(--color-neutral-10);
        white-space: nowrap;

        // paint-order 讓描邊畫在字體後面，等同 Figma 的 Outer，筆畫不會被吃掉
        paint-order: stroke fill;

        background: var(--bg-button-primary);
        backdrop-filter: blur(50px); // Figma bg-blur 100 ÷ 2
        box-shadow: var(--shadow-btn);

        transition:
            background 0.35s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        -webkit-text-stroke: var(--text-stroke-button-primary);

        // 按下去：變暗＋外陰影消失
        &:active {
            background: var(--bg-button-primary-act);
            box-shadow: var(--shadow-btn-active);
        }

        @media (hover: hover) {
            // hover：變亮＋外陰影換白的
            // :not(:active) 排掉「按著不放」時 hover 也成立的情況
            &:hover:not(:active) {
                background: var(--bg-button-primary-hv);
                box-shadow: var(--shadow-btn-hover);
            }
        }
    }

    @media (width >= 960px) {
        &__grid {
            grid-template-columns: repeat(3, 1fr);
            gap: var(--corner-5) 45px;
        }

        &__more {
            margin-top: 40px;
        }
    }
}
</style>
