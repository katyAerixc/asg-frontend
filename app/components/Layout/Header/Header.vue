<template>
    <header class="layout-header">
        <div class="layout-header__inner">
            <!-- Logo：手機用 h5 版、電腦（≥960px）用 pc 版，深淺主題各一張。
                 四張圖都掛在 CSS 變數上（見 index.scss），靠 media query 與 data-theme 決定載哪張 -->
            <NuxtLink
                aria-label="回首頁"
                class="layout-header__logo"
                to="/"
            />

            <div class="layout-header__user">
                <!-- 金幣膠囊：圖示 + 數字 + 重新整理 -->
                <div class="layout-header__coins">
                    <img
                        alt=""
                        class="layout-header__coin-icon"
                        src="~/assets/images/ui/money.png"
                    >
                    <span class="layout-header__coin-value">{{ formattedCoins }}</span>
                    <button
                        aria-label="重新整理餘額"
                        class="layout-header__refresh"
                        type="button"
                    >
                        <span class="layout-header__refresh-icon i-sp-refresh" />
                    </button>
                </div>

                <!-- 頭像 + 下拉箭頭；點了展開會員選單 -->
                <div
                    ref="menuRef"
                    class="layout-header__menu-wrap"
                >
                    <button
                        :aria-expanded="isMenuOpen"
                        aria-label="會員選單"
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

    <!-- 變更頭像彈窗：掛在 Header 上而不是選單裡，選單收起來時彈窗才不會一起不見 -->
    <LayoutHeaderAvatarPicker
        v-if="isPickerOpen"
        @close="closePicker"
    />

    <!-- 變更暱稱彈窗：同樣掛在 Header 上，選單收起來也不會跟著不見 -->
    <LayoutHeaderNicknameEditor
        v-if="isNicknameEditorOpen"
        @close="closeNicknameEditor"
    />
</template>

<script setup lang="ts">
// Define props, models and emits
const props = withDefaults(defineProps<{ coins?: number }>(), { coins: 100000000 });

// Variables
const menuRef = ref<HTMLElement | null>(null);
const isMenuOpen = ref(false);

const {
    closePicker,
    currentAvatar,
    isPickerOpen,
} = useAvatar();
const {
    closeNicknameEditor,
    isNicknameEditorOpen,
} = useProfile();

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

// Hooks
onMounted(() => {
    document.addEventListener('click', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
});

onUnmounted(() => {
    document.removeEventListener('click', closeOnOutsideClick);
    document.removeEventListener('keydown', closeOnEscape);
});
</script>

<style scoped lang="scss">
// 不黏住：往下捲時 Header 會跟著捲走，把畫面讓給篩選列（她 2026-09-09 定）
.layout-header {
    background: var(--bg-page);

    &__inner {
        position: relative;

        display: flex;
        gap: 16px;
        align-items: center;
        justify-content: space-between;

        max-width: 80rem;
        margin: 0 auto;
        padding: 12px 16px;

        // 下框線：橫向漸層（兩端透明、中間藍）。畫在這裡而不是 .layout-header，
        // 寬度才會跟內容一樣，不會拉到整個螢幕寬
        &::after {
            content: '';

            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;

            height: 1px;

            background: var(--line-header);
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

    &__user {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    // 金幣膠囊：Figma 215 × 40；最小寬 130（她 2026-09-09 指定），內容長就撐大
    &__coins {
        overflow: hidden;
        display: flex;
        flex: 0 1 auto;
        gap: 10px;
        align-items: center;
        justify-content: space-between;

        min-width: 130px;
        min-height: 40px;
        padding: var(--corner-1);
        border-radius: var(--corner-full);

        background: var(--bg-normal);
        backdrop-filter: blur(50px);
        box-shadow: var(--shadow-btn-glow-off), var(--shadow-btn);

        transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        // 只有真的有滑鼠的裝置才做 hover；手機沒有滑鼠，點完 :hover 會黏著不放
        @media (hover: hover) {
            &:hover {
                box-shadow: var(--shadow-btn-glow-on), var(--shadow-btn);
            }
        }
    }

    &__coin-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
    }

    // 金幣數字：Inter 18px / 500（Figma）
    &__coin-value {
        overflow: hidden;
        flex: 1;

        min-width: 0;

        font-size: 18px;
        font-weight: 500;
        color: var(--color-primary-10);
        text-align: center;
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

        width: 32px;
        height: 32px;
        padding: var(--corner-1);
        border: 0;
        border-radius: var(--corner-full);

        color: var(--color-primary-20);

        background: var(--bg-button-01);
        backdrop-filter: blur(50px);
        box-shadow: var(--shadow-btn);

        // hover：icon 放大 + 變白（她 2026-09-09 指定，這顆不要光暈、按鈕本身不變大）
        transition: color 0.35s;

        @media (hover: hover) {
            &:hover {
                color: var(--color-primary-10);
            }
        }
    }

    &__refresh-icon {
        width: 18px;
        height: 18px;
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
        box-shadow: var(--shadow-btn-glow-off), var(--shadow-btn);

        transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        @media (hover: hover) {
            &:hover {
                box-shadow: var(--shadow-btn-glow-on), var(--shadow-btn);
            }
        }
    }

    &__avatar-img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
    }

    // 會員選單：掛在頭像下方，靠右對齊（設計稿 top 63、往左展開）
    &__menu-wrap {
        position: relative;
    }

    &__menu {
        position: absolute;
        z-index: 60; // 要蓋過 Header 本身
        top: calc(100% + 11px); // 設計稿：頭像下方 63px 起算
        right: 0;
    }

    // 箭頭放在 20 × 20 的框裡置中（Figma 尺寸）
    &__avatar-arrow {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;

        width: 20px;
        height: 20px;

        color: var(--color-primary-20);

        // presetIcons 預設會把圖示拉滿容器且貼左上，要指定原比例並置中（Figma 12 × 6.67）
        background-position: center;
        background-size: 12px 6.67px;

        transition: transform 0.25s;

        // 選單展開時箭頭轉向上（設計稿指定）
        &--open {
            transform: rotate(180deg);
        }
    }

    // 滑到按鈕上時只有 icon 放大（圖示是 CSS 背景圖，不能選 svg/path）
    @media (hover: hover) {
        &__refresh:hover &__refresh-icon {
            transform: scale(1.1);
        }
    }

    @media (width >= 960px) {
        &__inner {
            padding: var(--corner-4) 16px;
        }

        &__logo {
            width: 226px;
            height: 62px;
            background-image: var(--logo-pc);
        }
    }
}
</style>
