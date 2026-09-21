<template>
    <div class="lobby">
        <!-- 哨兵：它捲出畫面 = 工具列黏住了，用來切換底色 -->
        <div
            ref="sentinelRef"
            class="lobby__sentinel"
        />

        <GameToolbar
            v-model:category="activeCategory"
            v-model:keyword="keyword"
            v-model:sort="activeSort"
            :stuck="isStuck"
        />

        <main class="lobby__main">
            <div class="lobby__title-row">
                <h1
                    class="lobby__title"
                    :class="{ 'lobby__title--searching': isSearching }"
                >
                    {{ isSearching ? $t('lobby.searchResult') : $t('lobby.title') }}
                </h1>
                <span class="lobby__count">{{ $t('lobby.count', { n: filteredGames.length }) }}</span>
            </div>

            <GameList
                :games="visibleGames"
                :has-more="hasMore"
                @load-more="loadMore"
            />
        </main>

        <div
            class="lobby__fade"
            aria-hidden="true"
        />
    </div>
</template>

<script setup lang="ts">
// 分享預覽圖暫用電腦版 Logo；設計師出 1200×630 的專用圖後換掉
import ogImage from '@/assets/images/logo/pc-dark.png';
import type {
    Game,
    GameCategoryFilter,
    GameSort,
} from '@/types/game';

// Composables
// 這裡要在 script 裡拿翻譯（模板用 $t 就好，不必宣告）
const { baseUrl, t } = useI18n();
// Variables
// 一次顯示幾張；點「加載更多」就把剩下的全放出來（之後接 API 改成每次要一頁）
const PAGE_SIZE = 6;
const visibleCount = ref(PAGE_SIZE);

// 篩選與排序條件放在頁面：工具列負責改它們，這裡負責算出要顯示哪些遊戲
const activeCategory = ref<GameCategoryFilter>('all');
const keyword = ref('');

const activeSort = ref<GameSort>('NEW');

// 工具列黏在頂部時才加底色：靠哨兵元素判斷（CSS 沒有「我黏住了」這種選擇器）
const sentinelRef = ref<HTMLElement | null>(null);
const isStuck = ref(false);
let stickyObserver: IntersectionObserver | null = null;

// 遊戲清單：資料來源在 composables/use-games.ts，之後接 API 只要改那一支
const { games } = useGames();

// Computed properties
// 分類、關鍵字都符合才顯示；分類選「全部」= 不篩分類，沒打字 = 不篩關鍵字
// ⚠️ 排序暫定：有對應標籤的排前面，其餘維持原順序。後端還沒給「上架時間／熱門度」欄位，接 API 後改由後端排序
const filteredGames = computed(() => {
    // 前後空白去掉、轉小寫，避免「打了空格就搜不到」與大小寫不符
    const search = keyword.value.trim().toLowerCase();

    const noCategory = activeCategory.value === 'all';

    const matched = games.value.filter((game) => {
        const matchCategory = noCategory || game.category === activeCategory.value;
        // 只搜遊戲名稱，不搜描述
        const matchKeyword = !search || game.name.toLowerCase().includes(search);

        return matchCategory && matchKeyword;
    });

    // toSorted 不改原陣列；同分時保留原順序
    const hasSortTag = (game: Game) => Number(game.tags.includes(activeSort.value));

    return matched.toSorted((a, b) => hasSortTag(b) - hasSortTag(a));
});

// 搜尋框有字 = 正在搜尋（標題換成「搜尋結果」）
const isSearching = computed(() => !!keyword.value.trim());

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
// 換篩選條件（含搜尋字）就回到第一頁，不然切回來會一次看到全部，「加載更多」形同虛設
watch([
    activeCategory,
    activeSort,
    keyword,
], () => {
    visibleCount.value = PAGE_SIZE;
}, { deep: true });

// 開始搜尋（搜尋框從空的變成有字）時，分類跳回全部，才是在所有遊戲裡找；排序不用動，它不會少掉遊戲
// 只在「開始」那一下跳：搜尋中再自己選分類縮小範圍不會被打斷
watch(isSearching, (searching) => {
    if (!searching) return;

    activeCategory.value = 'all';
});

// SEO 設定
// 值寫成函式（不是字串）：切語言時 <head> 才會跟著更新
// og:* 是貼到 LINE／FB 時的預覽卡片；og:image 一定要完整網址，相對路徑社群平台抓不到
useSeoMeta({
    description: () => t('seo.description'),
    ogDescription: () => t('seo.description'),
    ogImage: () => `${baseUrl.value}${ogImage}`,
    ogTitle: () => t('seo.title'),
    ogType: 'website',
    title: () => t('seo.title'),
    twitterCard: 'summary_large_image',
});
</script>

<style scoped lang="scss">
// 工具列的樣式在 Game/Toolbar.vue、卡片網格與加載更多在 Game/List.vue
.lobby {
    // Figma 用的是「以畫面為準」的遮罩，讓卡片在畫面最底下淡到剩 10%；
    // CSS 的 mask 只能跟著元素一起捲，做不到，改成疊一條頁面底色 90% 的漸層，看起來一樣
    &__fade {
        pointer-events: none;

        position: fixed;
        z-index: 30; // 蓋過遊戲卡，但在浮動搜尋鈕(45)、選單、彈窗底下
        right: 0;
        bottom: 0;
        left: 0;

        max-width: 1320px; // 跟卡片區同寬，兩側的背景光暈不要被蓋到
        height: 41px;
        margin: 0 auto;

        background: linear-gradient(transparent, var(--bg-page-sticky));
    }

    &__main {
        max-width: 1320px;
        margin: 0 auto;
        padding: 24px var(--corner-3) var(--corner-4);
    }

    // 哨兵：1px 高的透明元素，只負責讓 JS 知道工具列黏住了沒
    &__sentinel {
        height: 1px;
    }

    // 標題列：手機版靠左一行小灰字（搜尋結果 共 N 款遊戲）；電腦版左標題、右數量
    &__title-row {
        display: flex;
        flex-wrap: wrap;
        gap: 4px;
        align-items: center;

        margin-bottom: var(--corner-3);
    }

    // 手機版：沒搜尋時標題不顯示，只留「共 N 款遊戲」；字跟數量一樣是小灰字
    // 藏法不能用 display: none：Google 用手機版收錄，主標題藏掉會被打折，
    // 改成「畫面看不到、爬蟲與讀螢幕讀得到」
    &__title {
        position: absolute;

        overflow: hidden;

        width: 1px;
        height: 1px;

        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-40);
        white-space: nowrap;

        clip-path: inset(50%);

        &--searching {
            position: static;

            overflow: visible;

            width: auto;
            height: auto;

            white-space: normal;

            clip-path: none;
        }
    }

    &__count {
        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-40);
        white-space: nowrap;
    }

    @media (width >= 960px) {
        &__fade {
            height: 53px;
        }

        &__main {
            padding: 5px var(--corner-5) 40px; // 上 5 ＋ 工具列下內距 15 ＝ Figma 分類列到標題 20
        }

        &__title-row {
            gap: 16px;
            justify-content: space-between;
            margin-bottom: var(--corner-4);
        }

        &__title {
            position: static;

            overflow: visible;

            width: auto;
            height: auto;

            font-size: var(--font-size-26);
            font-weight: var(--font-weight-bold);
            color: var(--color-primary-10);
            white-space: normal;

            clip-path: none;
        }

        &__count {
            font-size: var(--font-size-16);
            text-align: right;
        }
    }
}
</style>
