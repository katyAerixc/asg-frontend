<template>
    <div
        class="game-toolbar"
        :class="{
            'game-toolbar--stuck': stuck,
            'game-toolbar--compact': isCompact,
        }"
    >
        <div class="game-toolbar__inner">
            <NuxtLink
                class="game-toolbar__logo"
                :aria-label="$t('header.home')"
                :to="localePath('/')"
            />

            <GameCategoryFilter
                class="game-toolbar__category"
                :class="{
                    'game-toolbar__category--stuck': stuck,
                    'game-toolbar__category--compact': isCompact,
                }"
                :active-category="category"
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
                        class="game-toolbar__toggle-btn"
                        :class="{ 'game-toolbar__toggle-btn--active': sort === option }"
                        type="button"
                        :aria-pressed="sort === option"
                        :data-text="option"
                        @click="sort = option"
                    >
                        <span class="game-toolbar__toggle-label">{{ option }}</span>
                    </button>
                </div>

                <label class="game-toolbar__search">
                    <input
                        v-model="keyword"
                        class="game-toolbar__search-input"
                        type="search"
                        :placeholder="$t('lobby.searchPlaceholder')"
                    >
                    <button
                        v-if="keyword"
                        class="game-toolbar__search-clear i-sp-close"
                        type="button"
                        :aria-label="$t('common.clear')"
                        @click="keyword = ''"
                        @mousedown.prevent
                    />
                    <span
                        v-else
                        class="game-toolbar__search-icon i-sp-search"
                    />
                </label>

                <div
                    class="game-toolbar__compact"
                    :class="{ 'game-toolbar__compact--show': isCompact }"
                >
                    <LayoutHeaderCompact class="game-toolbar__compact-inner" />
                </div>
            </div>
        </div>

        <Teleport to="#teleports">
            <Transition name="game-toolbar-compact">
                <NuxtLink
                    v-if="isCompact && isPageActive"
                    class="game-toolbar-logo-h5"
                    :aria-label="$t('header.home')"
                    :to="localePath('/')"
                />
            </Transition>

            <Transition name="game-toolbar-compact">
                <LayoutHeaderCompact
                    v-if="isCompact && isPageActive"
                    class="game-toolbar-compact-h5"
                />
            </Transition>
        </Teleport>

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
                            type="search"
                            :placeholder="$t('lobby.searchPlaceholder')"
                            @blur="closeFloat"
                            @input="ignoreScrollForAWhile"
                            @keydown.enter="closeFloat"
                        >
                        <button
                            v-if="keyword && isFloatOpen"
                            class="game-toolbar-float__clear i-sp-close"
                            type="button"
                            :aria-label="$t('common.clear')"
                            @click.stop="keyword = ''"
                            @mousedown.prevent
                        />
                        <span
                            v-else
                            class="game-toolbar-float__icon i-sp-search"
                        />
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

const { isCompact } = storeToRefs(useLayoutHeaderStore());
const localePath = useLocalePath();

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
// ⚠️ 根節點本身就是 sticky 的那層，template 外面不要再包 div——sticky 只在父層範圍內有效
.game-toolbar {
    position: sticky;
    z-index: 40;
    top: var(--header-h, 0); // 讓位給 Header；Header 收起來時跟著一起往上推（變數在 layouts/default.vue）
    transform: translateY(var(--header-shift, 0));

    background-color: transparent;

    transition:
        transform 0.3s ease,
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

    // 🧪 ?header=ours 版本：左邊只有圖示的 logo（跟手機 Header 同一張）＋整排字縮小一級
    // ⚠️ 一直都在、不要改成 v-if：一出現分類就被硬推過去，沒辦法做動畫
    // 平常寬 0、負的右邊距抵掉外層 gap 24，看起來就像不存在；visibility 讓它平常點不到、讀螢幕也略過
    &__logo {
        display: block;
        flex-shrink: 0;

        width: 0;
        height: 30px;
        margin-right: -24px;

        visibility: hidden;
        opacity: 0;
        background-image: var(--logo-h5);
        background-repeat: no-repeat;
        background-position: left center;
        background-size: contain;

        transition:
            width 0.3s ease,
            margin-right 0.3s ease,
            opacity 0.3s ease,
            visibility 0.3s;

        @media (width < 960px) {
            display: none;
        }
    }

    &--compact {
        --category-tab-font-size: var(--font-size-18); // 分類字級（變數在 CategoryFilter.vue）
    }

    &--compact &__logo {
        width: 32px;
        margin-right: 0;
        visibility: visible;
        opacity: 1;
    }

    // 分類一直靠左、篩選靠右：外層是 space-between，隱藏的 logo 也算一格，不加這行分類會被推到中間
    &__category {
        @media (width >= 960px) {
            margin-right: auto;
        }
    }

    // 🧪 ?header=ours 版本：電腦的縮小版金幣頭像，放在搜尋框右邊
    // ⚠️ 一直都在、不要改成 v-if：消失那一刻整塊被拿掉，NEW/HOT 與搜尋框會突然跳
    // 寬度用 grid 0fr → 1fr 慢慢長出來（寬度不用寫死）；負的左邊距抵掉外層 gap 15
    &__compact {
        display: grid;
        grid-template-columns: 0fr;

        margin-left: calc(var(--corner-3) * -1);

        visibility: hidden;
        opacity: 0;

        transition:
            grid-template-columns 0.3s ease,
            margin-left 0.3s ease,
            opacity 0.3s ease,
            visibility 0.3s;

        &--show {
            grid-template-columns: 1fr;
            margin-left: 0;
            visibility: visible;
            opacity: 1;
        }

        @media (width < 960px) {
            display: none;
        }
    }

    // 🚨 要 overflow: hidden 才縮得到 0；顯示後改回 visible，不然金幣膠囊的外陰影會被切掉
    &__compact-inner {
        overflow: hidden;
        min-width: 0;
    }

    &__compact--show &__compact-inner {
        overflow: visible;
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

        transition: height 0.3s ease;
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
            color var(--motion-hover),
            background-color var(--motion-hover),
            box-shadow var(--motion-hover),
            padding 0.3s ease,
            font-size 0.3s ease;

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
            0 0 0 0 var(--color-white-0) inset,
            0 0 0 0 var(--color-white-0),
            var(--shadow-input);

        // 平常補兩層全透明的（框、外圈），湊成跟 input-act-stroke 一樣的 5 層——層數不同 box-shadow 會直接跳、補不出漸變
        // 寬高內距：?header=ours 縮小版切換時平順變化
        transition:
            box-shadow var(--motion-hover),
            width 0.3s ease,
            height 0.3s ease,
            padding 0.3s ease;

        // focus-within 留著：那是真的「游標在裡面」，手機也該亮
        &:focus-within {
            box-shadow: var(--shadow-input-act-stroke);
        }

        @media (hover: hover) {
            &:hover {
                box-shadow: var(--shadow-input-act-stroke);
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

        transition: font-size 0.3s ease;

        &::placeholder {
            color: var(--color-primary-40);
        }

        // 瀏覽器自帶的清除 ✕ 藏起來，改用下面自己的清除鈕
        &::-webkit-search-cancel-button {
            display: none;
        }
    }

    // ⚠️ template 的 @mousedown.prevent 不要拿掉：游標才會留在輸入框裡
    // 圖比框小：框是點擊範圍
    &__search-clear {
        cursor: pointer;

        flex-shrink: 0;

        width: 19px;
        height: 19px;
        padding: 0;
        border: 0;

        color: var(--color-primary-10);

        background-color: currentcolor;

        mask-position: center;
        mask-size: 11.4px 11.4px;

        transition: opacity var(--motion-hover);

        @media (hover: hover) {
            &:hover {
                opacity: 0.7;
            }
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

    // NEW/HOT、搜尋框整顆縮小（只有電腦：手機這排不黏頂，縮了頁面會跳）；那排高度由分類決定，縮了也不會變矮
    @media (width >= 960px) {
        &--compact &__toggle {
            height: 32px;
        }

        &--compact &__toggle-btn {
            padding: 2px var(--corner-2);
            font-size: var(--font-size-16);
        }

        &--compact &__search {
            width: 240px;
            height: 32px; // 跟 NEW/HOT 同高
            padding: 0 var(--corner-2);
        }

        &--compact &__search-input {
            font-size: var(--font-size-16);
        }
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

        &__search-icon {
            color: var(--color-primary-30);
        }

        &__category {
            position: sticky;
            z-index: 40;
            top: var(--header-h, 0);
            transform: translateY(var(--header-shift, 0));

            // 下面留 8，跟排序那排的 10 加起來間距 18
            padding: 16px var(--corner-2) 8px;

            background-color: transparent;

            transition:
                transform 0.3s ease,
                padding 0.3s ease,
                background-color 0.25s ease,
                backdrop-filter 0.25s ease;

            &--stuck {
                background-color: var(--bg-page-sticky);
                backdrop-filter: blur(12px);
            }

            // 左邊讓出位置給 logo；上面讓出一條給金幣頭像
            // 上 16→28、下 8→0：選取底線下方不會空太多，總高度一樣是 76（高度變了頁面會跳）
            &--compact {
                --category-tab-font-size: var(--font-size-16);
                --category-tab-padding-x: 8px; // 五個分類才塞得下
                --category-tab-min-height: 40px;
                --category-tab-padding-bottom: 6px; // 下面少 4 挪到上面，總高度不變
                --category-tab-underline-bottom: 2px; // 底線貼近字

                padding: 28px var(--corner-2) 0 62px; // 左：logo 44 ＋ 左邊距 10 ＋ 間距 8
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
            height: 44px; // 寫死高度（跟內距撐出來的一樣），縮小版變 32 時才有辦法做動畫
        }

        // Figma PC/input：icon 框 24、圖 14.4 → 元素 14.4 ÷ (11.4 / 12) ≈ 15.2
        &__search-icon {
            width: 15.2px;
            height: 15.2px;
        }

        &__search-clear {
            width: 24px;
            height: 24px;
            mask-size: 14.4px 14.4px;
        }
    }
}

// 右下角浮動搜尋鈕（只有手機會出現）
// 收起是圓形鈕；展開往左長成整條搜尋框
// 外框左右貼齊，展開時框用 100% 就是「螢幕寬扣左右各 10」（100vw 會把電腦的捲軸也算進去）
// 外框本身不能擋到後面的遊戲卡，只有按鈕接收點擊
.game-toolbar-float {
    pointer-events: none;

    position: fixed;
    z-index: 45; // 蓋過遊戲卡與工具列(40)，但在頭像選單(60)與彈窗(100)底下
    right: var(--corner-2);
    bottom: calc(var(--corner-2) + env(safe-area-inset-bottom));
    left: var(--corner-2);

    display: flex;
    justify-content: flex-end;

    // Figma MB/btn/search（漸層在 ::before，展開時淡出）
    &__box {
        pointer-events: auto;
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

        width: 100%;
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

    // ⚠️ template 的 @mousedown.prevent 不要拿掉：不然輸入框先失焦、浮動框收起來，這顆就點不到了
    &__clear {
        cursor: pointer;

        flex-shrink: 0;

        width: 30px;
        height: 30px;
        padding: 0;
        border: 0;

        color: var(--color-primary-10);

        background-color: currentcolor;

        mask-position: center;
        mask-size: 18px 18px;
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

// 🧪 ?header=ours 版本：手機的 logo 與縮小版金幣頭像疊在分類列左右（電腦版在 .game-toolbar__logo、__compact）
.game-toolbar-logo-h5 {
    position: fixed;
    z-index: 41;
    top: 18px; // 放在頭像頂（12）到分類字底（66）的正中間
    left: var(--corner-2);

    display: block;

    width: 44px; // 圖是 80 × 76，高 42 等比算出來
    height: 42px;

    background-image: var(--logo-h5);
    background-repeat: no-repeat;
    background-position: left center;
    background-size: contain;

    @media (width >= 960px) {
        display: none;
    }
}

.game-toolbar-compact-h5 {
    position: fixed;
    z-index: 41; // 疊在黏頂分類列(40)上面
    top: 12px; // 放在分類列上面那條空白（分類字從 42 開始，中間留 8）
    right: var(--corner-2);

    @media (width >= 960px) {
        display: none;
    }
}

.game-toolbar-compact-enter-active,
.game-toolbar-compact-leave-active {
    transition:
        opacity 0.3s ease,
        transform 0.3s ease;
}

// 從上面輕輕滑下來（跟 Header 收起、滑出的方向一致）
.game-toolbar-compact-enter-from,
.game-toolbar-compact-leave-to {
    transform: translateY(-6px);
    opacity: 0;
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
