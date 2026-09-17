<template>
    <!-- ⚠️ 根節點本身就是 sticky 的那層，外面不要再包 div——sticky 只在父層範圍內有效 -->
    <div
        class="game-toolbar"
        :class="{ 'game-toolbar--stuck': stuck }"
    >
        <div class="game-toolbar__inner">
            <GameCategoryFilter
                :active-category="category"
                class="game-toolbar__category"
                :class="{ 'game-toolbar__category--stuck': stuck }"
                @update:active-category="category = $event"
            />

            <div
                ref="filtersRef"
                class="game-toolbar__filters"
            >
                <div class="game-toolbar__toggle">
                    <button
                        v-for="option in filterOptions"
                        :key="option"
                        :aria-pressed="sort === option"
                        class="game-toolbar__toggle-btn"
                        :class="{ 'game-toolbar__toggle-btn--active': sort === option }"
                        :data-text="option"
                        type="button"
                        @click="sort = option"
                    >
                        <span class="game-toolbar__toggle-label">{{ option }}</span>
                    </button>
                </div>

                <label class="game-toolbar__search">
                    <input
                        v-model="keyword"
                        class="game-toolbar__search-input"
                        :placeholder="$t('lobby.searchPlaceholder')"
                        type="search"
                    >
                    <span class="game-toolbar__search-icon i-sp-search" />
                </label>
            </div>
        </div>

        <Teleport to="#teleports">
            <Transition name="game-toolbar-float">
                <div
                    v-if="isPageActive && isFloatVisible"
                    ref="floatRef"
                    class="game-toolbar-float"
                    :class="{ 'game-toolbar-float--open': isFloatOpen }"
                >
                    <label
                        class="game-toolbar-float__box"
                        @click="openFloat"
                    >
                        <input
                            ref="floatInputRef"
                            v-model="keyword"
                            class="game-toolbar-float__input"
                            :placeholder="$t('lobby.searchPlaceholder')"
                            type="search"
                            @blur="closeFloat"
                            @input="ignoreScrollForAWhile"
                            @keydown.enter="closeFloat"
                        >
                        <span class="game-toolbar-float__icon i-sp-search" />
                    </label>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import type {
    GameCategoryFilter,
    GameSort,
} from '@/types/game';

// Define props, models and emits
// stuck 由頁面判斷（哨兵元素在頁面上，不在這支裡）
defineProps<{ stuck: boolean }>();

// 三個篩選條件都由頁面持有，頁面才算得出要顯示哪些遊戲
const category = defineModel<GameCategoryFilter>('category', { required: true });
// 排序：NEW / HOT 一定有一個被選中（排序不是篩選，沒有「全部」）
const sort = defineModel<GameSort>('sort', { required: true });
const keyword = defineModel<string>('keyword', { required: true });

// Variables
const filterOptions: GameSort[] = [
    'NEW',
    'HOT',
];

const filtersRef = ref<HTMLElement | null>(null);

// 浮動搜尋鈕（手機）：排序那排捲出畫面才出現
// 🚨 keepalive 會把舊語系的首頁暫存起來；暫存中的工具列不能再畫浮動鈕，不然切語系後會有兩顆
const isPageActive = ref(true);
const isFiltersOut = ref(false);
const isFloatOpen = ref(false);
const floatRef = ref<HTMLElement | null>(null);
const floatInputRef = ref<HTMLInputElement | null>(null);
// 手機跳出鍵盤、打字篩掉遊戲時頁面會跟著動，瀏覽器會當成捲動 → 這段時間內的捲動不算（打字時不收）
let ignoreScrollUntil = 0;
let filtersObserver: IntersectionObserver | null = null;

// Computed properties
// 展開中就算排序那排回到畫面也先留著，收起來才消失（不然打字篩選時頁面變短，按鈕會突然不見）
const isFloatVisible = computed(() => isFiltersOut.value || isFloatOpen.value);

// Functions
function closeFloat() {
    if (!isFloatOpen.value) return;

    isFloatOpen.value = false;
    floatInputRef.value?.blur();
}

// 點浮動鈕以外的地方就收起來
function closeFloatOnOutsideClick(event: MouseEvent) {
    if (!isFloatOpen.value) return;
    if (floatRef.value?.contains(event.target as Node)) return;

    closeFloat();
}

// 往上往下捲都收起來；但鍵盤剛跳出來、正在打字的那一下不算
function closeFloatOnScroll() {
    if (!isFloatOpen.value) return;
    if (Date.now() < ignoreScrollUntil) return;

    closeFloat();
}

function ignoreScrollForAWhile() {
    ignoreScrollUntil = Date.now() + 800;
}

// 點浮動鈕：展開並把游標送進去（跟上面的放大鏡一樣要等畫面畫好）
async function openFloat() {
    if (isFloatOpen.value) return;

    isFloatOpen.value = true;
    ignoreScrollForAWhile();
    await nextTick();
    floatInputRef.value?.focus();
}

// Hooks
onMounted(() => {
    document.addEventListener('click', closeFloatOnOutsideClick);
    window.addEventListener('scroll', closeFloatOnScroll, { passive: true });
    // 鍵盤跳出／收起會改變可視高度，也先別收
    window.visualViewport?.addEventListener('resize', ignoreScrollForAWhile);

    // 排序那排「往上」捲出畫面才算（電腦版工具列黏頂，永遠看得見，所以不會出現）
    if (filtersRef.value) {
        filtersObserver = new IntersectionObserver(([entry]) => {
            if (!entry) return;
            isFiltersOut.value = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        });
        filtersObserver.observe(filtersRef.value);
    }
});

// 頁面被 keepalive 暫存時收起浮動鈕；回到前台再重新判斷
onActivated(() => {
    isPageActive.value = true;
});

onDeactivated(() => {
    isPageActive.value = false;
    closeFloat();
});

onUnmounted(() => {
    document.removeEventListener('click', closeFloatOnOutsideClick);
    window.removeEventListener('scroll', closeFloatOnScroll);
    window.visualViewport?.removeEventListener('resize', ignoreScrollForAWhile);
    filtersObserver?.disconnect();
});
</script>

<style scoped lang="scss">
// 工具列外層：滿版（左右不留缺口）+ 黏在畫面最上面
// 沒黏住時透明（Figma 沒填色）；往下滑黏住才長出跟頁面同色的底，字才不會疊在卡片上
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
    // 手機版兩行之間留 24px（16px 太擠）
    &__inner {
        display: flex;
        flex-direction: column;
        gap: 24px;

        max-width: 1320px; // 跟下面卡片區同寬
        margin: 0 auto;
        padding: var(--corner-3);
    }

    &__filters {
        display: flex;
        gap: var(--corner-3);
        align-items: center;
    }

    // NEW / HOT：一顆膠囊、左右切換
    &__toggle {
        display: flex;
        gap: 0;
        align-items: center;
        justify-content: center;

        height: 38px;
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

        font-size: var(--font-size-18);
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
        // 🚨 不能加 overflow: hidden：最小寬度會變 0，點標籤時文字變粗，右邊搜尋框會被擠得晃
        &::before {
            content: attr(data-text);

            grid-area: 1 / 1;

            height: 0;

            font-weight: var(--font-weight-bold);

            visibility: hidden;
        }

        &--active {
            font-weight: var(--font-weight-bold);
            color: var(--color-primary-10);
            background-color: var(--color-primary-opacity-60-30);
            box-shadow: -1px 0 1px 0 var(--color-white-70) inset;
        }

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
        padding: var(--input-padding-y) var(--input-padding-x);
        border-radius: var(--corner-input);

        background: var(--bg-input);
        backdrop-filter: blur(25px);
        box-shadow:
            0 0 0 0 var(--color-white-0),
            var(--shadow-input);

        // 平常補一圈全透明的外圈，湊成跟 input_act 一樣的 4 層——層數不同 box-shadow 會直接跳、補不出漸變
        transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        // focus-within 留著：那是真的「游標在裡面」，手機也該亮
        &:focus-within {
            box-shadow: var(--shadow-input-act);
        }

        @media (hover: hover) {
            &:hover {
                box-shadow: var(--shadow-input-act);
            }
        }
    }

    &__search-input {
        flex: 1;

        min-width: 0;
        border: 0;

        font-size: var(--font-size-20);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-10);

        background: transparent;
        outline: none;

        &::placeholder {
            color: var(--color-primary-40);
        }
    }

    // 🚨 search.svg 沒有留白（viewBox 12、圖 11.4），Figma 的 icon 框有留白：要比「圖」的大小，不是比框
    // 手機 MB/btn/search：框 30、圖 18 → 元素 19；電腦見下面 @media
    &__search-icon {
        flex-shrink: 0;
        width: 19px;
        height: 19px;
        color: var(--color-primary-40); // 手機版另外覆寫
    }

    // 真的文字跟上面的幽靈文字疊在同一格
    &__toggle-label {
        grid-area: 1 / 1;
    }

    @media (width < 960px) {
        // 手機：只有「全部／老虎機…」分類列黏頂，排序那排跟著頁面捲走、改由右下角浮動鈕搜尋
        // sticky 只能在爸爸範圍內黏，所以外層兩層改 display: contents（盒子消失），分類列直接變成整頁的子元素才黏得住
        display: contents;

        &__toggle {
            height: 35px;
        }

        &__toggle-btn {
            font-size: var(--font-size-16);
        }

        &__search-input {
            font-size: var(--font-size-16);
        }

        &__category {
            position: sticky;
            z-index: 40;
            top: 0;

            // 下面留 8，跟排序那排的 10 加起來間距 18
            padding: 16px var(--corner-2) 8px;

            background-color: transparent;

            transition:
                background-color 0.25s ease,
                backdrop-filter 0.25s ease;

            &--stuck {
                background-color: var(--bg-page-sticky);
                backdrop-filter: blur(12px);
            }
        }

        // 手機：下方不留內距；內距改由分類列與排序那排各自負責
        &__inner {
            display: contents;
        }

        // 搜尋框吃掉剩下的寬度
        &__filters {
            gap: var(--corner-3);
            margin-top: 10px;
            padding: 0 var(--corner-3);
        }

        &__toggle {
            flex-shrink: 0;
        }
    }

    @media (width >= 960px) {
        // 電腦版：分類（左）與篩選（右）同一行
        &__inner {
            flex-direction: row;
            gap: 24px;
            align-items: center;
            justify-content: space-between;

            padding-inline: var(--corner-5); // 跟卡片區左右 30 對齊
        }

        &__filters {
            flex: 0 1 auto;
        }

        // 用 width 不用 flex-basis：外層寬度是「跟著內容」算的，瀏覽器算內容寬時看 width、不看 flex-basis，只寫 flex-basis 會被縮成 265
        &__search {
            flex: 0 1 auto;
            width: 280px;
        }

        // Figma PC/input：icon 框 24、圖 14.4 → 元素 14.4 ÷ (11.4 / 12) ≈ 15.2
        &__search-icon {
            width: 15.2px;
            height: 15.2px;
        }
    }
}

// 右下角浮動搜尋鈕（只有手機會出現）
// 收起是圓形鈕；展開往左長成整條搜尋框
.game-toolbar-float {
    position: fixed;
    z-index: 45; // 蓋過遊戲卡與工具列(40)，但在頭像選單(60)與彈窗(100)底下
    right: var(--corner-2);
    bottom: calc(var(--corner-2) + env(safe-area-inset-bottom));

    // Figma MB/btn/search（漸層在 ::before，展開時淡出）
    &__box {
        cursor: pointer;

        position: relative;

        display: flex;
        gap: 0;
        align-items: center;
        justify-content: center;

        width: 50px;
        height: 50px;
        padding: var(--corner-2);
        border-radius: var(--corner-full);

        background-color: transparent; // Figma 收起只有半透明漸層，底下不墊 Primary/90（展開才換上）
        backdrop-filter: blur(50px);
        box-shadow: var(--shadow-btn);

        transition:
            width 0.3s ease,
            gap 0.3s ease,
            padding 0.3s ease,
            background-color 0.3s ease,
            box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        &::before {
            content: '';

            position: absolute;
            z-index: -1;
            inset: 0;

            border-radius: inherit;

            background: var(--bg-button-01);

            transition: opacity 0.3s ease;
        }

        &:focus-within {
            box-shadow: var(--shadow-btn-hover);
        }
    }

    &__input {
        flex: 1;

        min-width: 0;
        max-width: 0;
        border: 0;

        font-size: var(--font-size-16);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-10);

        opacity: 0;
        background: transparent;
        outline: none;

        transition:
            max-width 0.3s ease,
            opacity 0.2s ease;

        &::placeholder {
            color: var(--color-primary-40);
        }
    }

    &__icon {
        flex-shrink: 0;
        width: 19px;
        height: 19px;
        color: var(--color-neutral-10);
    }

    // 展開：寬度＝螢幕寬扣掉左右各 10
    // 陰影是效果樣式 282:2752 ＝ --shadow-bg（內陰影模糊 2、外陰影排最後）
    &--open &__box {
        gap: 10px;

        width: calc(100vw - 20px);
        padding: var(--input-padding-y) var(--input-padding-x);

        background-color: var(--bg-input);
        backdrop-filter: blur(25px);
        box-shadow: var(--shadow-bg);

        &::before {
            opacity: 0;
        }
    }

    &--open &__icon {
        color: var(--color-primary-30);
    }

    &--open &__input {
        max-width: 100%;
        opacity: 1;
    }

    // 電腦版工具列會黏頂，不需要浮動鈕
    @media (width >= 960px) {
        display: none;
    }

    @media (prefers-reduced-motion: reduce) {
        &__box,
        &__box::before,
        &__input {
            transition: none;
        }
    }
}

// 出現／消失：淡入淡出＋往上浮一點
.game-toolbar-float-enter-active,
.game-toolbar-float-leave-active {
    transition:
        opacity 0.2s ease,
        transform 0.2s ease;
}

.game-toolbar-float-enter-from,
.game-toolbar-float-leave-to {
    transform: translateY(8px);
    opacity: 0;
}
</style>
