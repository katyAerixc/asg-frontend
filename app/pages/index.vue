<template>
    <div class="lobby">
        <!-- 工具列：電腦版分類（左）與篩選（右）同一行；手機版上下兩行 -->
        <div class="lobby__toolbar">
            <CategoryFilter
                :active-category="activeCategory"
                @update:active-category="activeCategory = $event"
            />

            <div class="lobby__filters">
                <!-- NEW / HOT 一顆膠囊、左右切換 -->
                <div class="lobby__toggle">
                    <button
                        v-for="option in sortOptions"
                        :key="option"
                        class="lobby__toggle-btn"
                        :class="{ 'lobby__toggle-btn--active': activeSort === option }"
                        :data-text="option"
                        type="button"
                        @click="activeSort = option"
                    >
                        {{ option }}
                    </button>
                </div>

                <label class="lobby__search">
                    <input
                        v-model="keyword"
                        class="lobby__search-input"
                        placeholder="Search"
                        type="search"
                    >
                    <span class="lobby__search-icon i-sp-search" />
                </label>
            </div>
        </div>

        <!-- 主要內容 -->
        <main class="lobby__main">
            <!-- 標題列：設計稿只有電腦版有 -->
            <div class="lobby__title-row">
                <h1 class="lobby__title">
                    精選遊戲
                </h1>
                <span class="lobby__count">共 {{ games.length }} 款遊戲</span>
            </div>

            <!-- 遊戲卡片網格：手機 2 欄、電腦 3 欄（照設計規格） -->
            <section class="lobby__grid">
                <GameCard
                    v-for="game in games"
                    :key="game.id"
                    :game="game"
                />
            </section>

            <!-- 加載更多（她要求新增；樣式暫定） -->
            <div class="lobby__more">
                <button
                    class="lobby__more-btn"
                    type="button"
                >
                    加載更多
                </button>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
import { useHead } from '#app';

// SEO 設定
useHead({
    meta: [
        {
            content: 'ASG 遊戲大廳提供多款精選遊戲，包括老虎機、魚機、棋牌和小遊戲。高 RTP、大獎金等你來挑戰。',
            name: 'description',
        },
        {
            content: '遊戲大廳,老虎機,魚機,棋牌,小遊戲,ASG',
            name: 'keywords',
        },
    ],
    title: 'ASG 遊戲大廳 - 精選遊戲',
});

const sortOptions = [
    'NEW',
    'HOT',
];

const activeCategory = ref('全部');
const activeSort = ref('NEW');
const keyword = ref('');

// 遊戲清單：資料來源在 composables/useGames.ts，之後接 API 只要改那一支
const { games } = useGames();
</script>

<style scoped lang="scss">
// ⚠️ 篩選列、加載更多按鈕的顏色尺寸多為暫定（來自設計規格 md），等 Figma 規格再對
.lobby {
    &__main {
        max-width: 80rem;
        margin: 0 auto;
        padding: 24px 16px;
    }

    // 工具列：手機上下兩行，電腦左右一行
    &__toolbar {
        display: flex;
        flex-direction: column;
        gap: 16px;

        max-width: 80rem;
        margin: 0 auto;
        padding: 16px;
    }

    // 標題列：設計稿只有電腦版有
    &__title-row {
        display: none;
        gap: 16px;
        align-items: center;
        justify-content: space-between;

        margin-bottom: 24px;
    }

    &__title {
        font-size: 24px;
        font-weight: 700;
        color: var(--color-primary-10);
    }

    &__count {
        font-size: 16px;
        font-weight: 300;
        color: var(--color-primary-40);
        text-align: right;
        white-space: nowrap;
    }

    &__filters {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    // NEW / HOT：一顆膠囊、左右切換（Figma input 風格：內嵌陰影 + 模糊）
    &__toggle {
        display: flex;
        gap: 10px;
        align-items: center;
        justify-content: center;

        padding: var(--corner-1);
        border-radius: var(--corner-full);

        background: var(--bg-input);
        backdrop-filter: blur(25px);
        box-shadow: var(--shadow-input);
    }

    // 多語系：不寫死寬度，靠 padding 撐開
    // 寬度用「看不見的粗體字」預先撐好，切換時字重變粗才不會抖動
    &__toggle-btn {
        cursor: pointer;

        display: grid; // 讓真實文字與撐寬用的幽靈文字疊在同一格
        place-items: center;

        padding: var(--corner-1) var(--corner-3);
        border: 0;
        border-radius: var(--corner-full);

        font-size: 16px;
        font-weight: 300;
        color: var(--color-primary-40);
        white-space: nowrap;

        background: transparent;

        // 幽靈文字：永遠是粗體、看不見，只負責把按鈕撐到最寬
        &::before {
            content: attr(data-text);

            overflow: hidden;
            grid-area: 1 / 1;

            height: 0;

            font-weight: 700;

            visibility: hidden;
        }

        &:hover {
            color: var(--color-primary-10);
        }

        &--active {
            font-weight: 700;
            color: var(--color-primary-10);
            background: var(--color-primary-opacity-6030);
            box-shadow: -1px 0 1px 0 rgb(255 255 255 / 70%) inset;
        }
    }

    &__search {
        display: flex;
        flex: 1 0 0;
        gap: 10px;
        align-items: center;

        min-width: 0;
        padding: var(--corner-2) var(--corner-3);
        border-radius: var(--corner-input);

        background: var(--bg-input);
        backdrop-filter: blur(25px);
        box-shadow: var(--shadow-btn-glow-off), var(--shadow-input);

        // hover：跟頭像同一組光暈
        transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover,
        &:focus-within {
            box-shadow: var(--shadow-btn-glow-on), var(--shadow-input);
        }
    }

    &__search-input {
        flex: 1;

        min-width: 0;
        border: 0;

        font-size: 16px;
        font-weight: 300;
        color: var(--color-primary-10);

        background: transparent;
        outline: none;

        &::placeholder {
            color: var(--color-primary-40);
        }
    }

    &__search-icon {
        flex-shrink: 0;
        width: 19px;
        height: 19px;
        color: var(--color-primary-30);
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
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
        border: 1px solid rgb(0 0 0 / 50%); // Figma Color/Black/50
        border-radius: var(--corner-full);

        font-size: 18px;
        font-weight: 500;
        line-height: 100%;
        color: var(--color-primary-10);
        white-space: nowrap;

        background: var(--bg-button-primary);
        box-shadow: var(--shadow-btn-glow-off), var(--shadow-btn);

        transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        &:hover {
            box-shadow: var(--shadow-btn-glow-on), var(--shadow-btn);
        }
    }

    @media (width >= 768px) {
        // 電腦版：分類（左）與篩選（右）同一行
        &__toolbar {
            flex-direction: row;
            gap: 24px;
            align-items: center;
            justify-content: space-between;
        }

        &__filters {
            flex: 0 1 445px;
        }

        &__title-row {
            display: flex;
        }

        &__grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 24px;
        }
    }
}
</style>
