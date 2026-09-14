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

                <div
                    ref="filtersRef"
                    class="lobby__filters"
                    :class="{ 'lobby__filters--searching': isSearchOpen }"
                >
                    <!-- ⚠️ 標籤要排在摘要鈕「前面」（她 2026-09-11 抓到）：
                         摘要鈕若排前面，它長出來時會把標籤往右推，看起來就是左右晃一下。
                         標籤放第一個，左邊就被釘死在容器左緣，不可能被推動。 -->

                    <!-- ALL / NEW / HOT / HIGH：ALL 是清除鍵，其餘可單選也可複選 -->
                    <div class="lobby__toggle">
                        <button
                            v-for="option in filterOptions"
                            :key="option"
                            :aria-pressed="isTagActive(option)"
                            class="lobby__toggle-btn"
                            :class="{ 'lobby__toggle-btn--active': isTagActive(option) }"
                            :data-text="option"
                            type="button"
                            @click="toggleTag(option)"
                        >
                            {{ option }}
                        </button>
                    </div>

                    <!-- 手機版展開搜尋時，四顆標籤鈕收成這一顆；再點一下收回去 -->
                    <button
                        class="lobby__summary"
                        type="button"
                        @click="isSearchOpen = false"
                    >
                        {{ tagSummary }}
                    </button>

                    <label
                        class="lobby__search"
                        @click="openSearch"
                    >
                        <input
                            ref="searchInputRef"
                            v-model="keyword"
                            class="lobby__search-input"
                            :placeholder="$t('lobby.searchPlaceholder')"
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
                    {{ $t('lobby.title') }}
                </h1>
                <span class="lobby__count">{{ $t('lobby.count', { n: filteredGames.length }) }}</span>
            </div>

            <!-- 遊戲卡片網格：手機 2 欄、電腦 3 欄（照設計規格） -->
            <section class="lobby__grid">
                <LayoutGameCard
                    v-for="game in visibleGames"
                    :key="game.id"
                    :game="game"
                />
            </section>

            <!-- 加載更多：全部載完就自己消失 -->
            <div
                v-if="hasMore"
                class="lobby__more"
            >
                <button
                    class="lobby__more-btn"
                    type="button"
                    @click="loadMore"
                >
                    {{ $t('lobby.loadMore') }}
                </button>
            </div>
        </main>
    </div>

    <!-- 遊戲介紹彈窗：從遊戲卡上的 ⓘ 打開，掛在頁面上而不是卡片裡 -->
    <LayoutGameDetail
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
// 第一顆 ALL 是「不篩選」，等於清除鍵；後面三顆是遊戲卡片上的標籤
const filterOptions = [
    'ALL',
    'NEW',
    'HOT',
    'HIGH',
];

// 一次顯示幾張；點「加載更多」就把剩下的全放出來（之後接 API 改成每次要一頁）
const PAGE_SIZE = 6;
const visibleCount = ref(PAGE_SIZE);

const activeCategory = ref<GameCategoryFilter>('all');
const keyword = ref('');

// 手機版寬度不夠塞四顆標籤 + 搜尋框（320 時四顆就要 299px，只剩 -11px）
// 所以搜尋框平常收成一顆放大鏡，點了才展開；標籤列同時收成一顆摘要鈕
const isSearchOpen = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);
const filtersRef = ref<HTMLElement | null>(null);

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

// 搜尋展開時，四顆標籤鈕收成這一顆：沒選 = ALL、選一個 = HOT、選多個 = HOT +1
const tagSummary = computed(() => {
    const tags = activeTags.value;

    if (!tags.length) return 'ALL';
    if (tags.length === 1) return tags[0];

    return `${tags[0]} +${tags.length - 1}`;
});

// 點到搜尋列以外的地方就收回去（她 2026-09-11 指定）
function closeSearchOnOutsideClick(event: MouseEvent) {
    if (!isSearchOpen.value) return;
    if (filtersRef.value?.contains(event.target as Node)) return;

    isSearchOpen.value = false;
}

// Functions
// ALL 只有在「什麼標籤都沒選」時才亮
function isTagActive(option: string) {
    if (option === 'ALL') return !activeTags.value.length;

    return activeTags.value.includes(option);
}

// 目前是假資料，一次把剩下的全放出來；接 API 後改成每次多要一頁
function loadMore() {
    visibleCount.value = filteredGames.value.length;
}

// 點放大鏡：先展開，等畫面畫好再把游標送進輸入框（不等的話 input 還不存在）
async function openSearch() {
    if (isSearchOpen.value) return;

    isSearchOpen.value = true;
    await nextTick();
    searchInputRef.value?.focus();
}

// ALL 就是清除鍵；其他標籤點一下開關切換
function toggleTag(option: string) {
    if (option === 'ALL') {
        activeTags.value = [];

        return;
    }

    const index = activeTags.value.indexOf(option);

    if (index === -1) {
        activeTags.value.push(option);
    } else {
        activeTags.value.splice(index, 1);
    }
}

// Hooks
onMounted(() => {
    document.addEventListener('click', closeSearchOnOutsideClick);

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
    document.removeEventListener('click', closeSearchOnOutsideClick);
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

        &--active {
            font-weight: 700;
            color: var(--color-primary-10);
            background-color: var(--color-primary-opacity-6030);
            box-shadow: -1px 0 1px 0 var(--color-white-70) inset;
        }

        // 只有真的有滑鼠的裝置才做 hover；手機點完 :hover 會黏著不放
        @media (hover: hover) {
            &:hover {
                color: var(--color-primary-10);
            }
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

        // focus-within 留著：那是真的「游標在裡面」，手機也該亮
        &:focus-within {
            box-shadow: var(--shadow-btn-glow-on), var(--shadow-input);
        }

        @media (hover: hover) {
            &:hover {
                box-shadow: var(--shadow-btn-glow-on), var(--shadow-input);
            }
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
        color: var(--color-search-icon);
    }

    // 手機版展開搜尋時，四顆標籤鈕收成的這一顆（電腦版空間夠，永遠不出現）
    // 長相跟選中的 toggle-btn 一致，讓人一眼認出「這是篩選狀態」
    &__summary {
        cursor: pointer;

        display: none;
        flex-shrink: 0;
        align-items: center;

        padding: var(--corner-1) var(--corner-3);
        border: 0;
        border-radius: var(--corner-full);

        font-size: 16px;
        font-weight: 700;
        color: var(--color-primary-10);
        white-space: nowrap;

        background-color: var(--color-primary-opacity-6030);
        box-shadow: -1px 0 1px 0 var(--color-white-70) inset;
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

        @media (hover: hover) {
            &:hover {
                box-shadow: var(--shadow-btn-glow-on), var(--shadow-btn);
            }
        }
    }

    // 手機版寬度不夠並排：搜尋框平常收成正方形，點了才展開
    @media (width < 960px) {
        // 手機：下方不留內距（她 2026-09-11 指定），區塊間距縮到 18
        &__toolbar-inner {
            gap: 18px;
            padding-bottom: 0;
        }

        // 320 只有 288px 可用，內距與間距全部縮一階才擠得下四顆 + 放大鏡
        &__filters {
            gap: 6px;
        }

        // 展開搜尋時要能「縮到 0」，所以用 max-width 而不是 display: none
        // ——display 沒辦法做動畫（她 2026-09-11 要求展開與收回都要有動畫）
        // 🚨 只讓 max-width 動，其他都別動（她 2026-09-11 抓到「會彈一下」）：
        //    ①flex-shrink: 0 —— 不然 flex 也會出手壓縮，跟 max-width 兩股力互搶
        //    ②padding 不做動畫 —— box-sizing 是 border-box，max-width 0 時內距本來就被裁掉
        //    ③overflow: hidden 取代 overflow-x: auto —— 捲動容器在縮放途中會抖
        &__toggle {
            overflow: hidden;
            flex-shrink: 0;
            gap: 4px;

            // 靠左（她 2026-09-11 指定）：預設是 center，盒子縮窄時按鈕會往中間靠、
            // 看起來像 ALL 在滑動。靠左的話只會從右邊被裁掉，ALL 原地不動
            justify-content: flex-start;

            min-width: 0;
            max-width: 30rem;

            opacity: 1;

            transition:
                max-width 0.3s ease,
                opacity 0.2s ease;
        }

        &__toggle-btn {
            flex-shrink: 0;
            padding: var(--corner-1) var(--corner-2);
        }

        // 摘要鈕平常縮成 0 寬（不是 display: none），展開時才長出來
        &__summary {
            overflow: hidden;
            display: flex;
            flex-shrink: 0;

            max-width: 0;

            opacity: 0;

            transition:
                max-width 0.3s ease,
                opacity 0.2s ease;
        }

        &__search {
            // 🚨 不要用 flex-grow 做動畫（她 2026-09-11 抓到「收起來時往右跑一下」）：
            //    flex-grow 是「比例」不是百分比。整排只有它一個會長，所以 0.01 跟 1 拿到的
            //    空間一樣多，動畫全程都是全寬，直到歸零才啪一下彈回去。
            //    改用 width（真正的長度），才會一格一格平滑地變。
            flex: 0 1 auto;

            // 收起時不要留字與圖示之間的間距，不然放大鏡會被往右推 10px、看起來沒置中
            gap: 0;
            justify-content: center;

            width: 44px;

            // 把左邊剩下的空間全吃掉，放大鏡就會貼齊右邊
            margin-left: auto;
            padding: var(--corner-2);

            transition:
                width 0.3s ease,
                gap 0.3s ease,
                padding 0.3s ease,
                box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }

        &__search-input {
            max-width: 0;
            opacity: 0;
            transition:
                max-width 0.3s ease,
                opacity 0.2s ease;
        }

        // 展開後：四顆標籤讓位給摘要鈕，寬度全給搜尋框
        &__filters--searching &__toggle {
            max-width: 0;
            opacity: 0;
        }

        &__filters--searching &__summary {
            max-width: 12rem;
            opacity: 1;
        }

        &__filters--searching &__search {
            width: 100%;
            padding: var(--corner-2) var(--corner-3);
        }

        &__filters--searching &__search-input {
            max-width: 100%;
            opacity: 1;
        }

        // 系統設定「減少動態效果」的人直接切換，不做動畫
        @media (prefers-reduced-motion: reduce) {
            &__toggle,
            &__summary,
            &__search,
            &__search-input {
                transition: none;
            }
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
