<template>
    <header class="site-header">
        <div class="site-header__inner">
            <!-- Logo：手機用 h5 版、電腦（≥768px）用 pc 版；<picture> 只會載入其中一張 -->
            <picture class="site-header__logo">
                <source
                    media="(min-width: 768px)"
                    srcset="/images/logo_pc.png"
                >
                <img
                    alt="ASG"
                    src="/images/logo_h5.png"
                >
            </picture>

            <div class="site-header__user">
                <!-- 金幣膠囊：圖示 + 數字 + 重新整理 -->
                <div class="site-header__coins">
                    <img
                        alt=""
                        class="site-header__coin-icon"
                        src="/images/money.png"
                    >
                    <span class="site-header__coin-value">{{ formattedCoins }}</span>
                    <button
                        aria-label="重新整理餘額"
                        class="site-header__refresh"
                        type="button"
                    >
                        <IconRefresh class="site-header__refresh-icon" />
                    </button>
                </div>

                <!-- 頭像 + 下拉箭頭 -->
                <button
                    aria-label="會員選單"
                    class="site-header__avatar"
                    type="button"
                >
                    <img
                        alt=""
                        class="site-header__avatar-img"
                        src="/images/avatar.png"
                    >
                    <span class="site-header__avatar-arrow">
                        <IconChevronDown />
                    </span>
                </button>
            </div>
        </div>
    </header>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ coins?: number }>(), { coins: 100000000 });

// 千位逗號：100000000 → 100,000,000
const formattedCoins = computed(() => props.coins.toLocaleString('en-US'));
</script>

<style scoped lang="scss">
.site-header {
    position: sticky;
    z-index: 50;
    top: 0;

    border-bottom: 1px solid var(--color-border-soft);

    background: var(--bg-page);

    &__inner {
        display: flex;
        gap: 16px;
        align-items: center;
        justify-content: space-between;

        max-width: 80rem;
        margin: 0 auto;
        padding: 12px 16px;
    }

    // Figma：電腦版 logo 224 × 44
    &__logo img {
        height: 32px;
    }

    &__user {
        display: flex;
        gap: 12px;
        align-items: center;
    }

    // 金幣膠囊：Figma 215 × 40（多語系用 min-width，不寫死 width）
    &__coins {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: center;

        min-width: 215px;
        min-height: 40px;
        padding: var(--corner-1) var(--corner-1) var(--corner-1) var(--corner-2);
        border-radius: var(--corner-full);

        background: var(--bg-normal);
        backdrop-filter: blur(50px);
        box-shadow: var(--shadow-btn);
    }

    &__coin-icon {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
    }

    // 金幣數字：Inter 18px / 500（Figma）
    &__coin-value {
        font-size: 18px;
        font-weight: 500;
        color: var(--color-primary-10);
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
    }

    &__refresh-icon {
        width: 18px;
        height: 18px;
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
    }

    @media (width >= 768px) {
        &__inner {
            padding: 29px 16px;
        }

        &__logo img {
            height: 44px;
        }
    }
}
</style>
