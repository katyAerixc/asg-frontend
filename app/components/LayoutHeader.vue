<template>
    <header class="layout-header">
        <div class="layout-header__inner">
            <!-- Logo：手機用 h5 版、電腦（≥768px）用 pc 版；<picture> 只會載入其中一張 -->
            <NuxtLink
                aria-label="回首頁"
                class="layout-header__logo"
                to="/"
            >
                <picture>
                    <source
                        media="(min-width: 768px)"
                        srcset="~/assets/images/logo/pc-dark.png"
                    >
                    <img
                        alt="ASG"
                        src="~/assets/images/logo/h5-dark.png"
                    >
                </picture>
            </NuxtLink>

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

                <!-- 頭像 + 下拉箭頭 -->
                <button
                    aria-label="會員選單"
                    class="layout-header__avatar"
                    type="button"
                >
                    <img
                        alt=""
                        class="layout-header__avatar-img"
                        src="~/assets/images/ui/avatar.png"
                    >
                    <span class="layout-header__avatar-arrow i-sp-arrow-down" />
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
// Define props, models and emits
const props = withDefaults(defineProps<{ coins?: number }>(), { coins: 100000000 });

// Computed properties
// 千位逗號：100000000 → 100,000,000
const formattedCoins = computed(() => props.coins.toLocaleString('en-US'));
</script>

<style scoped lang="scss">
.layout-header {
    position: sticky;
    z-index: 50;
    top: 0;
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

    // Figma：logo 元件自帶 padding 9px 12px，電腦版圖 224 × 44
    &__logo {
        display: flex;
        align-items: center;
        padding: 9px 12px;
    }

    &__logo img {
        height: 32px;
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

        &:hover {
            box-shadow: var(--shadow-btn-glow-on), var(--shadow-btn);
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

        &:hover {
            color: var(--color-primary-10);
        }
    }

    &__refresh-icon {
        width: 18px;
        height: 18px;
        transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1);
    }

    // 滑到按鈕上時只有 icon 放大（圖示是 CSS 背景圖，不能選 svg/path）
    &__refresh:hover &__refresh-icon {
        transform: scale(1.1);
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

        &:hover {
            box-shadow: var(--shadow-btn-glow-on), var(--shadow-btn);
        }
    }

    &__avatar-img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
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
    }

    @media (width >= 768px) {
        &__inner {
            padding: var(--corner-4) 16px;
        }

        &__logo img {
            height: 44px;
        }
    }
}
</style>
