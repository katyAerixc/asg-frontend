<template>
    <div
        class="layout"
        :class="{ 'layout--header-hidden': isHidden }"
    >
        <!-- ⚠️ 黏頂的 sticky 要寫在這層外框：寫在組件身上，父層只跟它一樣高，黏不住 -->
        <!-- 往下捲收起來、往上捲一點就滑出來；鍵盤 Tab 進來時也要出現，不然會按到看不見的東西 -->
        <div
            ref="header"
            class="layout__header"
            :class="{ 'layout__header--solid': isScrolled }"
            @focusin="revealForKeyboard"
            @mouseleave="hideAfterMouse"
        >
            <LayoutHeader :coins="userCoins" />
        </div>

        <main class="layout__page">
            <slot />
        </main>

        <GameDetail
            v-if="openedGame"
            :game="openedGame"
        />
    </div>
</template>

<script setup lang="ts">
// Composables
const { openedGame } = storeToRefs(useGameDetailStore());
const headerStore = useLayoutHeaderStore();
const { isHidden } = storeToRefs(headerStore);
const {
    hide,
    reveal,
    showCompact,
} = headerStore;
const route = useRoute();

// Variables
// ⚠️ 之後接 API 時改從 composable 拿
const userCoins = ref(100000000);

// 捲超過這個距離才開始收：只捲一點點就收，畫面會一直閃
const HIDE_AFTER = 200;
// 往上／往下捲累積這麼多才算數：手指放開時的回彈、滑鼠滾輪的抖動不算
// ⚠️ 往下也要累積：縮小版出現／消失時那排高度差 1px，瀏覽器會自動把頁面挪 1px，不擋的話會被當成往下捲又收起來
const SCROLL_THRESHOLD = 8;
// 設計師版：滑鼠移到畫面最上面這幾 px 內，Header 才出現
const MOUSE_ZONE = 20;

const headerRef = useTemplateRef<HTMLElement>('header');
const isScrolled = ref(false);
let lastY = 0;
let upDistance = 0;
let downDistance = 0;
// 能用滑鼠的裝置才走「滑鼠移到上方」；手機沒有滑鼠，照舊往上滑就出現
let canHover = false;
let revealedByMouse = false;

// Computed properties
// 🧪 兩個版本給設計師選：預設＝設計師版，?header=ours＝我們的版本。選定後刪掉沒選的那個
const isOursMode = computed(() => route.query.header === 'ours');
const isMouseMode = () => !isOursMode.value && canHover;

// 滑鼠叫出來的 Header，滑鼠離開就收回去；選單開著時不收，不然選單會跟著消失
function hideAfterMouse() {
    if (!revealedByMouse || lastY <= HIDE_AFTER) return;
    if (headerRef.value?.querySelector('[aria-expanded="true"]')) return;

    revealedByMouse = false;
    hide();
}

function onMouseMove(event: MouseEvent) {
    if (!isMouseMode() || !isHidden.value || event.clientY > MOUSE_ZONE) return;

    revealedByMouse = true;
    reveal();
}

// Functions
function onScroll() {
    const y = Math.max(window.scrollY, 0); // iOS 拉過頭回彈時會是負的
    const delta = y - lastY;
    lastY = y;
    isScrolled.value = y > 0;

    if (y <= HIDE_AFTER) {
        upDistance = 0;
        downDistance = 0;
        reveal();
        return;
    }

    if (delta > 0) {
        upDistance = 0;
        downDistance += delta;
        if (downDistance < SCROLL_THRESHOLD) return;
        // 鍵盤焦點還在 Header 裡就不收，不然焦點框會跟著消失
        if (!headerRef.value?.matches(':has(:focus-visible)')) hide();
        return;
    }

    downDistance = 0;
    upDistance -= delta;
    if (upDistance < SCROLL_THRESHOLD || isMouseMode()) return;

    if (isOursMode.value) showCompact();
    else reveal();
}

// 鍵盤焦點進到收起來的 Header：瀏覽器會自己捲動去找它、而且捲過頭，所以出現之後把頁面放回原位
function revealForKeyboard() {
    if (!isHidden.value) return;

    const y = lastY;
    reveal();
    requestAnimationFrame(() => window.scrollTo(0, y));
}

// Hooks
onMounted(() => {
    lastY = window.scrollY;
    isScrolled.value = lastY > 0;
    canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
});

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('mousemove', onMouseMove);
});
</script>

<style scoped lang="scss">
.layout {
    // Header 實際的高度：黏頂的分類列要讓出這麼多位置（手機 69、電腦見下面）
    --header-h: 69px;
    --header-shift: 0px;

    display: flex;
    flex-direction: column;
    min-height: 100svh; // iPhone 的 vh 是網址列收起來的高度，比實際看得到的高

    // ⚠️ 收起來用 transform 往上推，黏頂的分類列也吃同一個變數一起推：
    //    一個用 transform、一個用 top 的話，捲動中兩邊速度不同，中間會裂出空白
    &--header-hidden {
        --header-shift: calc(var(--header-h) * -1);
    }

    // 頭像選單在極窄螢幕要用 cqw 量整排寬度（100vw 會把電腦的捲軸也算進去）
    &__header {
        position: sticky;
        z-index: 50; // 蓋過黏頂的分類列(40)、浮動搜尋鈕(45)，在彈窗(100)底下
        top: 0;
        transform: translateY(var(--header-shift));

        container-type: inline-size;

        transition: transform 0.3s ease;

        // 離開最上面就要有底色：Header 蓋在遊戲卡上，不加的話字會疊在一起（跟黏頂的分類列同一個底）
        // ⚠️ 底色與模糊畫在 ::before，不要直接寫在 Header 身上：外層有 backdrop-filter 時，
        //    裡面的頭像選單只能模糊到 Header 自己，後面的遊戲卡模糊不到，看起來就像沒模糊
        &::before {
            content: '';

            position: absolute;
            z-index: -1;
            inset: 0;

            opacity: 0;
            background-color: var(--bg-page-sticky);
            backdrop-filter: blur(12px);

            transition: opacity 0.25s ease;
        }

        &--solid::before {
            opacity: 1;
        }
    }

    &__page {
        flex: 1;
    }

    @media (width >= 960px) {
        --header-h: 103px;
    }

    // 使用者若在系統開了「減少動態效果」，直接出現／消失，不滑動
    @media (prefers-reduced-motion: reduce) {
        &__header {
            transition: none;
        }
    }
}
</style>
