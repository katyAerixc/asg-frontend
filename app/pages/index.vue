<template>
    <div class="lobby">
        <!-- 哨兵：只有 1px 高。它捲出畫面 = 工具列黏住了，用來切換底色 -->
        <div
            ref="sentinelRef"
            class="lobby__sentinel"
        />

        <!-- 工具列：分類、標籤篩選、搜尋 -->
        <GameToolbar
            v-model:category="activeCategory"
            v-model:keyword="keyword"
            v-model:tags="activeTags"
            :stuck="isStuck"
        />

        <!-- 主要內容 -->
        <main class="lobby__main">
            <!-- 標題列：設計稿只有電腦版有 -->
            <div class="lobby__title-row">
                <h1 class="lobby__title">
                    {{ $t('lobby.title') }}
                </h1>
                <span class="lobby__count">{{ $t('lobby.count', { n: filteredGames.length }) }}</span>
            </div>

            <GameList
                :games="visibleGames"
                :has-more="hasMore"
                @load-more="loadMore"
            />
        </main>
    </div>

    <!-- 遊戲介紹彈窗：點遊戲卡打開，掛在頁面上而不是卡片裡 -->
    <GameDetail
        v-if="openedGame"
        :game="openedGame"
    />
</template>

<script setup lang="ts">
import type { GameCategoryFilter } from '@/types/game';

// Composables
// 這裡要在 script 裡拿翻譯（模板用 $t 就好，不必宣告）
const { t } = useI18n();
const { openedGame } = useGameDetail();
// Variables
// 一次顯示幾張；點「加載更多」就把剩下的全放出來（之後接 API 改成每次要一頁）
const PAGE_SIZE = 6;
const visibleCount = ref(PAGE_SIZE);

// 三個篩選條件放在頁面：工具列負責改它們，這裡負責算出要顯示哪些遊戲
const activeCategory = ref<GameCategoryFilter>('all');
const keyword = ref('');

// 標籤篩選：空陣列 = ALL（不篩選）。可單選、複選；全部取消會自動回到 ALL
const activeTags = ref<string[]>([]);

// 工具列黏在頂部時才加底色：靠哨兵元素判斷（CSS 沒有「我黏住了」這種選擇器）
const sentinelRef = ref<HTMLElement | null>(null);
const isStuck = ref(false);
let stickyObserver: IntersectionObserver | null = null;

// 遊戲清單：資料來源在 composables/use-games.ts，之後接 API 只要改那一支
const { games } = useGames();

// Computed properties
// 三個條件是「且」的關係：分類、標籤、關鍵字，全部符合才顯示
// 分類選「全部」= 不篩分類；標籤一個都沒選（ALL）= 不篩標籤；沒打字 = 不篩關鍵字
const filteredGames = computed(() => {
    // 前後空白去掉、轉小寫，避免「打了空格就搜不到」與大小寫不符
    const search = keyword.value.trim().toLowerCase();

    const noCategory = activeCategory.value === 'all';
    const noTags = !activeTags.value.length;

    return games.value.filter((game) => {
        const matchCategory = noCategory || game.category === activeCategory.value;
        const matchTags = noTags || game.tags.some((tag) => activeTags.value.includes(tag));
        // 只搜遊戲名稱，不搜描述（她 2026-09-10 定）
        const matchKeyword = !search || game.name.toLowerCase().includes(search);

        return matchCategory && matchTags && matchKeyword;
    });
});

// 只渲染看得到的那幾張，卡片變多時不會全部一次掛上去
const visibleGames = computed(() => filteredGames.value.slice(0, visibleCount.value));

// 還有沒載完的才顯示「加載更多」
const hasMore = computed(() => visibleCount.value < filteredGames.value.length);

// Functions
// 目前是假資料，一次把剩下的全放出來；接 API 後改成每次多要一頁
function loadMore() {
    visibleCount.value = filteredGames.value.length;
}

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

// Watchers
// 換篩選條件就回到第一頁，不然切回來會一次看到全部，「加載更多」形同虛設
watch([
    activeCategory,
    activeTags,
], () => {
    visibleCount.value = PAGE_SIZE;
}, { deep: true });

// SEO 設定
// 值寫成函式（不是字串）：切語言時 <head> 才會跟著更新
useHead({
    meta: [
        {
            content: () => t('seo.description'),
            name: 'description',
        },
        {
            content: () => t('seo.keywords'),
            name: 'keywords',
        },
    ],
    title: () => t('seo.title'),
});
</script>

<style scoped lang="scss">
// 工具列的樣式在 Game/Toolbar.vue、卡片網格與加載更多在 Game/List.vue
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

    @media (width >= 960px) {
        &__title-row {
            display: flex;
        }
    }
}
</style>
