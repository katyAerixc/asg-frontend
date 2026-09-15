<template>
    <!-- 工具列：外層負責滿版底色與黏頂，內層才限制最大寬度（同 Header 的做法）
         ⚠️ 根節點本身就是 sticky 的那層，外面不要再包 div——sticky 只在父層範圍內有效 -->
    <div
        class="game-toolbar"
        :class="{ 'game-toolbar--stuck': stuck }"
    >
        <div class="game-toolbar__inner">
            <GameCategoryFilter
                :active-category="category"
                @update:active-category="category = $event"
            />

            <div
                ref="filtersRef"
                class="game-toolbar__filters"
                :class="{ 'game-toolbar__filters--searching': isSearchOpen }"
            >
                <!-- ⚠️ 標籤要排在摘要鈕「前面」（她 2026-09-11 抓到）：
                     摘要鈕若排前面，它長出來時會把標籤往右推，看起來就是左右晃一下。
                     標籤放第一個，左邊就被釘死在容器左緣，不可能被推動。 -->

                <!-- ALL / NEW / HOT / HIGH：ALL 是清除鍵，其餘可單選也可複選 -->
                <div class="game-toolbar__toggle">
                    <button
                        v-for="option in filterOptions"
                        :key="option"
                        :aria-pressed="isTagActive(option)"
                        class="game-toolbar__toggle-btn"
                        :class="{ 'game-toolbar__toggle-btn--active': isTagActive(option) }"
                        :data-text="option"
                        type="button"
                        @click="toggleTag(option)"
                    >
                        {{ option }}
                    </button>
                </div>

                <!-- 手機版展開搜尋時，四顆標籤鈕收成這一顆；再點一下收回去 -->
                <button
                    class="game-toolbar__summary"
                    type="button"
                    @click="isSearchOpen = false"
                >
                    {{ tagSummary }}
                </button>

                <label
                    class="game-toolbar__search"
                    @click="openSearch"
                >
                    <input
                        ref="searchInputRef"
                        v-model="keyword"
                        class="game-toolbar__search-input"
                        :placeholder="$t('lobby.searchPlaceholder')"
                        type="search"
                    >
                    <span class="game-toolbar__search-icon i-sp-search" />
                </label>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { GameCategoryFilter } from '@/types/game';

// Define props, models and emits
// stuck 由頁面判斷（哨兵元素在頁面上，不在這支裡）
defineProps<{ stuck: boolean }>();

// 三個篩選條件都由頁面持有，頁面才算得出要顯示哪些遊戲
const category = defineModel<GameCategoryFilter>('category', { required: true });
// 空陣列 = ALL（不篩選）。可單選、複選；全部取消會自動回到 ALL
const tags = defineModel<string[]>('tags', { required: true });
const keyword = defineModel<string>('keyword', { required: true });

// Variables
// 第一顆 ALL 是「不篩選」，等於清除鍵；後面三顆是遊戲卡片上的標籤
const filterOptions = [
    'ALL',
    'NEW',
    'HOT',
    'HIGH',
];

// 手機版寬度不夠塞四顆標籤 + 搜尋框（320 時四顆就要 299px，只剩 -11px）
// 所以搜尋框平常收成一顆放大鏡，點了才展開；標籤列同時收成一顆摘要鈕
const isSearchOpen = ref(false);
const searchInputRef = ref<HTMLInputElement | null>(null);
const filtersRef = ref<HTMLElement | null>(null);

// Computed properties
// 搜尋展開時，四顆標籤鈕收成這一顆：沒選 = ALL、選一個 = HOT、選多個 = HOT +1
const tagSummary = computed(() => {
    if (!tags.value.length) return 'ALL';
    if (tags.value.length === 1) return tags.value[0];

    return `${tags.value[0]} +${tags.value.length - 1}`;
});

// Functions
// 點到搜尋列以外的地方就收回去（她 2026-09-11 指定）
function closeSearchOnOutsideClick(event: MouseEvent) {
    if (!isSearchOpen.value) return;
    if (filtersRef.value?.contains(event.target as Node)) return;

    isSearchOpen.value = false;
}

// ALL 只有在「什麼標籤都沒選」時才亮
function isTagActive(option: string) {
    if (option === 'ALL') return !tags.value.length;

    return tags.value.includes(option);
}

// 點放大鏡：先展開，等畫面畫好再把游標送進輸入框（不等的話 input 還不存在）
async function openSearch() {
    if (isSearchOpen.value) return;

    isSearchOpen.value = true;
    await nextTick();
    searchInputRef.value?.focus();
}

// ALL 就是清除鍵；其他標籤點一下開關切換
// 用「換一個新陣列」而不是 push / splice：陣列是頁面的，不要在這裡直接改它的內容
function toggleTag(option: string) {
    if (option === 'ALL') {
        tags.value = [];

        return;
    }

    tags.value = tags.value.includes(option)
        ? tags.value.filter((tag) => tag !== option)
        : [
            ...tags.value,
            option,
        ];
}

// Hooks
onMounted(() => {
    document.addEventListener('click', closeSearchOnOutsideClick);
});

onUnmounted(() => {
    document.removeEventListener('click', closeSearchOnOutsideClick);
});
</script>

<style scoped lang="scss">
// ⚠️ 篩選列的顏色尺寸多為暫定（來自設計規格 md），等 Figma 規格再對
// 工具列外層：滿版（左右不留缺口）+ 黏在畫面最上面
// 沒黏住時完全透明；黏住才長出半透明底色與模糊
.game-toolbar {
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

    // 工具列內層：限制最大寬度、手機上下兩行、電腦左右一行
    // 手機版兩行之間留 24px（她 2026-09-09 說 16px 太擠）
    &__inner {
        display: flex;
        flex-direction: column;
        gap: 24px;

        max-width: 80rem;
        margin: 0 auto;
        padding: 16px;
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

        font-size: var(--font-size-16);
        font-weight: var(--font-weight-regular);
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

            font-weight: var(--font-weight-bold);

            visibility: hidden;
        }

        &--active {
            font-weight: var(--font-weight-bold);
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

        font-size: var(--font-size-16);
        font-weight: var(--font-weight-regular);
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

        font-size: var(--font-size-16);
        font-weight: var(--font-weight-bold);
        color: var(--color-primary-10);
        white-space: nowrap;

        background-color: var(--color-primary-opacity-6030);
        box-shadow: -1px 0 1px 0 var(--color-white-70) inset;
    }

    // 手機版寬度不夠並排：搜尋框平常收成正方形，點了才展開
    @media (width < 960px) {
        // 手機：下方不留內距（她 2026-09-11 指定），區塊間距縮到 18
        &__inner {
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
        &__inner {
            flex-direction: row;
            gap: 24px;
            align-items: center;
            justify-content: space-between;
        }

        &__filters {
            flex: 0 1 445px;
        }
    }
}
</style>
