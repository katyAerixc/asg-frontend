<template>
    <button
        class="header-compact"
        type="button"
        :aria-label="$t('header.memberMenu')"
        @click="reveal"
    >
        <img
            class="header-compact__avatar"
            aria-hidden="true"
            :alt="$t('header.myAvatar')"
            :src="currentAvatar.image"
            :title="$t('header.myAvatar')"
        >

        <span class="header-compact__coins">
            <img
                class="header-compact__coin-icon"
                aria-hidden="true"
                src="~/assets/images/ui/money.png"
                :alt="$t('header.coin')"
                :title="$t('header.coin')"
            >
            <span class="header-compact__coin-value">{{ formattedCoins }}</span>
        </span>
    </button>
</template>

<script setup lang="ts">
// Define props, models and emits
const props = withDefaults(defineProps<{ coins?: number }>(), { coins: 100000000 });

// Variables
const { currentAvatar } = storeToRefs(useUserStore());
const { reveal } = useLayoutHeaderStore();

// Computed properties
const formattedCoins = computed(() => props.coins.toLocaleString('en-US'));
</script>

<style scoped lang="scss">
// 金幣在左、頭像在右並排（DOM 是頭像在前，所以用 row-reverse）
// 手機整組縮小放在分類列上面那條空白；電腦放在搜尋框右邊
.header-compact {
    cursor: pointer;

    display: flex;
    flex-direction: row-reverse;
    flex-shrink: 0;
    gap: 6px;
    align-items: center;

    padding: 0;
    border: 0;

    background: transparent;

    &__avatar {
        width: 22px;
        height: 22px;
        border: 1px solid var(--color-neutral-10);
        border-radius: var(--corner-full);
    }

    &__coins {
        display: flex;
        gap: 2px;
        align-items: center;

        height: 20px;
        padding: 0 var(--corner-1) 0 2px;
        border-radius: var(--corner-full);

        background: var(--bg-normal);
        backdrop-filter: blur(25px);
        box-shadow: var(--shadow-btn);
    }

    &__coin-icon {
        width: 16px;
        height: 16px;
    }

    &__coin-value {
        font-size: var(--font-size-12);
        font-weight: var(--font-weight-medium);
        font-variant-numeric: tabular-nums;
        line-height: 1.4;
        color: var(--color-primary-10);
        white-space: nowrap;
    }

    @media (width >= 960px) {
        gap: var(--corner-2);

        &__avatar {
            width: 30px;
            height: 30px;
        }

        &__coins {
            gap: var(--corner-1);
            height: 30px;
            padding: 0 var(--corner-2) 0 var(--corner-1);
        }

        &__coin-icon {
            width: 22px;
            height: 22px;
        }

        &__coin-value {
            font-size: var(--font-size-14);
        }
    }
}
</style>
