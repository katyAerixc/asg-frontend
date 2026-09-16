<template>
    <div class="game-list">
        <!-- 遊戲卡片網格：手機 2 欄、電腦 3 欄（照設計規格） -->
        <section class="game-list__grid">
            <GameCard
                v-for="game in games"
                :key="game.id"
                :game="game"
            />
        </section>

        <!-- 加載更多：全部載完就自己消失 -->
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
// ⚠️ 加載更多按鈕的顏色尺寸多為暫定（來自設計規格 md），等 Figma 規格再對
.game-list {
    &__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: var(--corner-3) 16px; // Figma MB/Home：上下 15、左右 16（390 寬時卡片剛好 172）
    }

    &__more {
        display: flex;
        justify-content: center;
        margin-top: 32px;
    }

    // Figma PC/btn/Medium：高 46、圓角 100、左右內距 28、藍色漸層
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
        color: var(--color-neutral-10); // Figma Color/Neutral/10
        white-space: nowrap;

        // Figma：文字自己有 1px Black/50 描邊（Outer）；疊在藍色漸層上看起來是深藍
        // paint-order 讓描邊畫在字體後面，等同 Figma 的 Outer，筆畫不會被吃掉
        paint-order: stroke fill;

        background: var(--bg-button-primary);
        backdrop-filter: blur(50px); // Figma btn/default：bg-blur 100 ÷ 2
        box-shadow: var(--shadow-btn);

        transition:
            background 0.35s cubic-bezier(0.4, 0, 0.2, 1),
            box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        -webkit-text-stroke: var(--text-stroke-button-primary);

        // Figma btn act：漸層 20% → 70%（變暗）＋ 外陰影消失
        &:active {
            background: var(--bg-button-primary-act);
            box-shadow: var(--shadow-btn-active);
        }

        @media (hover: hover) {
            // Figma btn hv：漸層起點 50% → 80%（變亮）＋ 外陰影換白的
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
            gap: var(--corner-5) 45px; // Figma PC/Home：上下 30、左右 45（1320 寬時卡片剛好 390）
        }

        &__more {
            margin-top: 40px; // Figma：卡片區到加載更多 40
        }
    }
}
</style>
