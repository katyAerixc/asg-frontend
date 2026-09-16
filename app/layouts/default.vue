<template>
    <div class="layout">
        <!-- ⚠️ 黏頂的 sticky 要寫在這層外框：寫在組件身上，父層只跟它一樣高，黏不住 -->
        <div class="layout__header">
            <LayoutHeader :coins="userCoins" />
        </div>

        <main class="layout__page">
            <slot />
        </main>

        <div class="layout__footer">
            <LayoutFooter />
        </div>

        <GameDetail
            v-if="openedGame"
            :game="openedGame"
        />
    </div>
</template>

<script setup lang="ts">
// Composables
const { openedGame } = storeToRefs(useGameDetailStore());

// Variables
// ⚠️ 之後接 API 時改從 composable 拿
const userCoins = ref(100000000);
</script>

<style scoped lang="scss">
.layout {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: var(--bg-page);

    &__page {
        flex: 1;
    }
}
</style>
