<template>
    <header class="layout-header">
        <div class="layout-header__inner">
            <NuxtLink
                :aria-label="$t('header.home')"
                class="layout-header__logo"
                :to="localePath('/')"
            />

            <div class="layout-header__user">
                <div class="layout-header__coins">
                    <img
                        alt=""
                        class="layout-header__coin-icon"
                        src="~/assets/images/ui/money.png"
                    >
                    <span class="layout-header__coin-value">{{ formattedCoins }}</span>
                    <button
                        :aria-label="$t('header.refreshBalance')"
                        class="layout-header__refresh"
                        type="button"
                    >
                        <span class="layout-header__refresh-icon i-sp-refresh" />
                    </button>
                </div>

                <div
                    ref="menuRef"
                    class="layout-header__menu-wrap"
                >
                    <button
                        :aria-expanded="isMenuOpen"
                        :aria-label="$t('header.memberMenu')"
                        class="layout-header__avatar"
                        type="button"
                        @click="isMenuOpen = !isMenuOpen"
                    >
                        <img
                            alt=""
                            class="layout-header__avatar-img"
                            :src="currentAvatar.image"
                        >
                        <span
                            class="layout-header__avatar-arrow i-sp-arrow-down"
                            :class="{ 'layout-header__avatar-arrow--open': isMenuOpen }"
                        />
                    </button>

                    <LayoutHeaderMenu
                        v-if="isMenuOpen"
                        class="layout-header__menu"
                    />
                </div>
            </div>
        </div>
    </header>

    <LayoutProfileAvatarPicker
        v-if="isAvatarPickerOpen"
        @close="closeAvatarPicker"
    />

    <LayoutProfileNicknameEditor
        v-if="isNicknameEditorOpen"
        @close="closeNicknameEditor"
    />

    <LayoutSupport v-if="isSupportOpen" />
</template>

<script setup lang="ts">
// Define props, models and emits
const props = withDefaults(defineProps<{ coins?: number }>(), { coins: 100000000 });

// Variables
// 回首頁要帶目前語系的前綴（英文 /en、越南文 /vi），寫死 '/' 會跳回繁中（她 2026-09-15 抓到）
const localePath = useLocalePath();
const menuRef = ref<HTMLElement | null>(null);
const isMenuOpen = ref(false);

// 狀態在 store（全站同一份）；解構要經過 storeToRefs 才保得住反應性，函式直接拿
const userStore = useUserStore();
const {
    currentAvatar,
    isAvatarPickerOpen,
    isNicknameEditorOpen,
} = storeToRefs(userStore);
const { closeAvatarPicker, closeNicknameEditor } = userStore;
const { isOpen: isSupportOpen } = storeToRefs(useSupportStore());

// Computed properties
// 千位逗號：100000000 → 100,000,000
const formattedCoins = computed(() => props.coins.toLocaleString('en-US'));

// 按 Esc 也關掉，鍵盤使用者才有出口
function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') isMenuOpen.value = false;
}

// Functions
// 點到選單以外的地方就收起來（點頭像本身由按鈕自己切換，不會被這裡誤關）
function closeOnOutsideClick(event: MouseEvent) {
    if (!isMenuOpen.value) return;
    if (menuRef.value?.contains(event.target as Node)) return;

    isMenuOpen.value = false;
}

// 捲動就收起來：Header 不是黏住的，往下捲時選單會跟著跑掉，
// 留著它會浮在半空中變成鬼影（她 2026-09-11 定，以後任何下拉都比照）
function closeOnScroll() {
    if (!isMenuOpen.value) return;

    isMenuOpen.value = false;
}

// Hooks
onMounted(() => {
    document.addEventListener('click', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);

    // passive：只是讀捲動事件、不會擋它，捲起來才不會卡
    window.addEventListener('scroll', closeOnScroll, { passive: true });
});

onUnmounted(() => {
    document.removeEventListener('click', closeOnOutsideClick);
    document.removeEventListener('keydown', closeOnEscape);
    window.removeEventListener('scroll', closeOnScroll);
});
</script>

<style scoped lang="scss">
// 不黏住：往下捲時 Header 會跟著捲走，把畫面讓給篩選列（她 2026-09-09 定）
// 沒有底色：Figma header 只有下框線、沒有填色，後面的光暈要透出來（她 2026-09-17 說要和 Figma 一樣）
.layout-header {
    &__inner {
        position: relative;

        display: flex;
        gap: var(--corner-3);
        align-items: center;
        justify-content: space-between;

        max-width: 80rem;
        margin: 0 auto;

        // 下內距 +1：框線是 ::after 絕對定位、不佔空間，要自己留 1px，不然會吃掉下內距
        padding: var(--corner-2) var(--corner-3) calc(var(--corner-2) + 1px);

        // 下框線：橫向漸層（兩端透明、中間藍）。畫在這裡而不是 .layout-header，
        // 寬度才會跟內容一樣，不會拉到整個螢幕寬
        &::after {
            content: '';

            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;

            height: 1px;

            background: var(--line-3);
        }
    }

    // 圖檔本身已含留白（手機 5px、電腦上下 8 左右 10），這裡不再加 padding
    // 圖是 2 倍匯出，顯示成一半才是 1:1，最銳利（手機 80×76、電腦 452×124）
    &__logo {
        display: block;

        width: 40px;
        height: 38px;

        background-image: var(--logo-h5);
        background-repeat: no-repeat;
        background-position: left center;
        background-size: contain;
    }

    // 手機：佔滿 Logo 右邊剩下的空間，金幣膠囊才撐得開（設計稿 1-1 主頁-1）
    &__user {
        display: flex;
        flex: 1;
        gap: var(--corner-3);
        align-items: center;

        min-width: 0;
    }

    // 金幣膠囊：Figma 215 × 40；最小寬 130（她 2026-09-09 指定）
    // 手機撐滿 Logo 與頭像中間；最寬 242 = 414 寬時中間的空間（414 − 內距 32 − Logo 40 − 間距 16 − 頭像 72 − 間距 12），
    // 再寬（平板）就停在 242、靠右貼著頭像，跟電腦版一樣（她 2026-09-15 定：414 填滿、960 以下不置中改靠右）
    &__coins {
        // 手機是 Figma 的 bg 效果、電腦是 btn/default；抽成變數，hover 那層才不用再寫一次
        --coins-shadow: var(--shadow-bg);

        overflow: hidden;
        display: flex;
        flex: 1;
        gap: 10px;
        align-items: center;
        justify-content: space-between;

        min-width: 130px;
        max-width: 242px;
        min-height: 38px;
        margin-left: auto;
        padding: var(--corner-1);
        border-radius: var(--corner-full);

        background: var(--bg-normal);
        backdrop-filter: blur(25px);
        box-shadow:
            0 0 0 0 var(--color-white-0),
            var(--coins-shadow);

        transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        // 只有真的有滑鼠的裝置才做；手機沒有滑鼠，點完 :hover 會黏著不放
        @media (hover: hover) {
            &:hover {
                box-shadow: var(--shadow-pc-hover), var(--coins-shadow);
            }
        }
    }

    &__coin-icon {
        flex-shrink: 0;
        width: 30px;
        height: 30px;
    }

    // 金幣數字：Inter 18px / 500（Figma）
    &__coin-value {
        // 「…」要裁左右；上下不裁，聲調、泰文上下標才不會被切（2026-09-17）
        // 舊瀏覽器（iOS 16 以前）看不懂 clip → 停在 hidden，退回原本的樣子
        overflow: hidden;
        overflow: clip visible;
        flex: 1;

        min-width: 0;

        font-size: var(--font-size-18);
        font-weight: var(--font-weight-medium);
        color: var(--color-primary-10);
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // 重新整理鈕：Figma 32 × 32，button/01 漸層
    &__refresh {
        cursor: pointer;

        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;

        width: 30px;
        height: 30px;
        padding: var(--corner-1);
        border: 0;
        border-radius: var(--corner-full);

        color: var(--color-primary-20);

        background: var(--bg-button-01);
        backdrop-filter: blur(50px);
        box-shadow: var(--shadow-btn);

        // hover：icon 放大 + 變白（她 2026-09-09 指定，按鈕本身不變大）
        // Figma PC/btn/refresh 只有 default 與 press 兩態，滑入本來就不變陰影
        transition:
            color 0.35s,
            box-shadow 0.35s;

        // Figma btn=press：外陰影換成白的
        &:active {
            box-shadow: var(--shadow-btn-hover);
        }

        @media (hover: hover) {
            &:hover {
                color: var(--color-primary-10);
            }
        }
    }

    &__refresh-icon {
        width: 22px;
        height: 22px;
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    // 頭像：Figma padding 4px、gap 4px、圓角 100px
    &__avatar {
        cursor: pointer;

        display: flex;
        gap: var(--corner-1);
        align-items: center;
        justify-content: center;

        padding: var(--corner-1);
        border: 0;
        border-radius: var(--corner-full);

        background: var(--bg-normal);
        backdrop-filter: blur(50px);
        box-shadow: var(--shadow-btn);

        transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        // Figma 3-1 會員選單：選單打開時頭像膠囊用 btn/hover（外圈變白）
        &[aria-expanded='true'] {
            box-shadow: var(--shadow-btn-hover);
        }

        @media (hover: hover) {
            &:hover {
                box-shadow: var(--shadow-btn-hover);
            }
        }
    }

    &__avatar-img {
        width: 40px;
        height: 40px;
        border-radius: var(--corner-full);
        outline: 1px solid var(--color-primary-20);
    }

    // 會員選單：掛在頭像下方，靠右對齊（設計稿 top 63、往左展開）
    &__menu-wrap {
        position: relative;
    }

    &__menu {
        position: absolute;
        z-index: 60; // 要蓋過 Header 本身
        top: calc(100% + 5px); // Figma：選單頂距頭像膠囊頂 63（PC 膠囊高 58）／53（H5 膠囊高 48），兩邊都離膠囊底 5
        right: 0;
    }

    // 箭頭放在 20 × 20 的框裡置中（Figma 尺寸）
    &__avatar-arrow {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;

        width: 15px;
        height: 15px;

        color: var(--color-primary-20);

        // UnoCSS 的圖示是「遮罩」，尺寸要用 mask-size 控制——background-size 對遮罩沒有作用。
        // ⚠️ 2026-09-11 踩過：svg 的 fill 從寫死色改成 currentColor 後，
        //    UnoCSS 會從 background-image 模式切成 mask 模式，原本的 background-size 就失效，
        //    圖示被 mask-size: 100% 100% 拉滿整個框 → 又大又變形。
        // 框與圖都照 Figma：手機 15 框 / 9 × 5 圖，電腦 20 框 / 12 × 6.67 圖。
        mask-position: center;
        mask-size: 9px 5px;

        transition: transform 0.25s;

        // 選單展開時箭頭轉向上（設計稿指定）
        &--open {
            transform: rotate(180deg);
        }
    }

    // 滑到按鈕上時只有 icon 放大（圖示是 CSS 背景圖，不能選 svg/path）
    @media (hover: hover) {
        &__refresh:hover &__refresh-icon {
            transform: scale(calc(26 / 24));
        }
    }

    // 電腦版照 Figma PC/Home header（Frame 10679，她 2026-09-15 定）
    @media (width >= 960px) {
        // 內容寬 1320（Figma 固定寬、左右不留內距）；左右 16 只是窄螢幕的安全邊，寬螢幕時內容剛好 1320
        // 高 103 = 上 Corner-4 ＋ Logo 62 ＋ 下 Corner-4 ＋ 下框線 1
        &__inner {
            max-width: calc(1320px + 16px * 2);
            padding: var(--corner-4) 16px calc(var(--corner-4) + 1px);

            // 下框線跟內容一樣寬 1320，不含左右安全邊
            &::after {
                right: 16px;
                left: 16px;
            }
        }

        &__logo {
            width: 226px;
            height: 62px;
            background-image: var(--logo-pc);
        }

        // 電腦：金幣與頭像照舊靠右，兩者間距 10
        &__user {
            flex: 0 1 auto;
            gap: 10px;
        }

        // Figma 金幣膠囊 215 × 40：金額變短膠囊也不縮、旁邊不會跟著動；更長的金額可以撐大
        &__coins {
            --coins-shadow: var(--shadow-btn);

            flex: 0 1 auto;

            min-width: 215px;
            max-width: none;
            min-height: 40px;
            margin-left: 0;

            backdrop-filter: blur(50px);
        }

        // Figma：金幣圖 32、數字 20／500、重整鈕 32 裡面圖示 24
        &__coin-icon {
            width: 32px;
            height: 32px;
        }

        &__coin-value {
            font-size: var(--font-size-20);
        }

        &__refresh {
            width: 32px;
            height: 32px;
        }

        &__refresh-icon {
            width: 24px;
            height: 24px;
        }

        // Figma 頭像膠囊 82 × 58 = 內距 4 ＋ 頭像 50 ＋ 間距 4 ＋ 箭頭 20 ＋ 內距 4
        &__avatar-img {
            width: 50px;
            height: 50px;
            outline-color: var(--color-neutral-10);
        }

        &__avatar-arrow {
            width: 20px;
            height: 20px;
            mask-size: 12px 6.67px;
        }
    }
}
</style>
