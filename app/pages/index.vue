<template>
    <div class="lobby">
        <!-- 哨兵：只有 1px 高。它捲出畫面 = 工具列黏住了，用來切換底色 -->
        <div
            ref="sentinelRef"
            class="lobby__sentinel"
        />

        <!-- 工具列：外層負責滿版底色與黏頂，內層才限制最大寬度（同 Header 的做法） -->
        <div
            class="lobby__toolbar"
            :class="{ 'lobby__toolbar--stuck': isStuck }"
        >
            <div class="lobby__toolbar-inner">
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
// Variables
const sortOptions = [
    'NEW',
    'HOT',
];

const activeCategory = ref('全部');
const activeSort = ref('NEW');
const keyword = ref('');

// 工具列黏在頂部時才加底色：靠哨兵元素判斷（CSS 沒有「我黏住了」這種選擇器）
const sentinelRef = ref<HTMLElement | null>(null);
const isStuck = ref(false);
let stickyObserver: IntersectionObserver | null = null;

// 遊戲清單：資料來源在 composables/use-games.ts，之後接 API 只要改那一支
const { games } = useGames();

// Hooks
onMounted(() => {
    if (!sentinelRef.value) return;

    // 哨兵還看得見 = 在頁面頂端；看不見 = 已經捲上去，工具列黏住了
    stickyObserver = new IntersectionObserver(
        ([entry]) => {
            isStuck.value = !entry?.isIntersecting;
        },
    );
    stickyObserver.observe(sentinelRef.value);
});

onUnmounted(() => {
    stickyObserver?.disconnect();
    stickyObserver = null;
});

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
</script>

<style scoped lang="scss">
// ⚠️ 篩選列、加載更多按鈕的顏色尺寸多為暫定（來自設計規格 md），等 Figma 規格再對
.lobby {
    &__main {
        max-width: 80rem;
        margin: 0 auto;
        padding: 24px 16px;
    }

    // 哨兵：1px 高的透明元素，只負責讓 JS 知道工具列黏住了沒
    &__sentinel {
        height: 1px;
    }

    // 工具列外層：滿版（左右不留缺口）+ 黏在畫面最上面
    // 沒黏住時完全透明；黏住才長出半透明底色與模糊
    &__toolbar {
        position: sticky;
        z-index: 40;
        top: 0;

        background-color: transparent;

        transition:
            background-color 0.25s ease,
            backdrop-filter 0.25s ease;

        &--stuck {
            background-color: var(--bg-page-sticky);
            backdrop-filter: blur(12px);
        }
    }

    // 工具列內層：限制最大寬度、手機上下兩行、電腦左右一行
    // 手機版兩行之間留 24px（她 2026-09-09 說 16px 太擠）
    &__toolbar-inner {
        display: flex;
        flex-direction: column;
        gap: 24px;

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

        background-color: transparent;

        // 起點放一條「透明的內嵌線」，切換時才能平滑長出來（不然是硬切換，會閃）
        box-shadow: -1px 0 1px 0 var(--color-white-0) inset;

        transition:
            color 0.2s ease,
            background-color 0.2s ease,
            box-shadow 0.2s ease;

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
            background-color: var(--color-primary-opacity-6030);
            box-shadow: -1px 0 1px 0 var(--color-white-70) inset;
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
        border: 1px solid var(--color-black-50); // Figma Color/Black/50
        border-radius: var(--corner-full);

        font-size: 18px;
        font-weight: 500;
        line-height: 100%;
        color: var(--color-neutral-10); // Figma Color/Neutral/10
        white-space: nowrap;

        // Figma：文字自己有 1px Black/50 描邊（Outer）；疊在藍色漸層上看起來是深藍
        // paint-order 讓描邊畫在字體後面，等同 Figma 的 Outer，筆畫不會被吃掉
        paint-order: stroke fill;

        background: var(--bg-button-primary);
        box-shadow: var(--shadow-btn-glow-off), var(--shadow-btn);

        transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        -webkit-text-stroke: 3px var(--color-navy-50);

        &:hover {
            box-shadow: var(--shadow-btn-glow-on), var(--shadow-btn);
        }
    }

    @media (width >= 960px) {
        // 電腦版：分類（左）與篩選（右）同一行
        &__toolbar-inner {
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
