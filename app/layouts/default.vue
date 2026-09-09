<template>
    <!-- 版面骨架：Header / 內容 / Footer 三區分離 -->
    <!-- 頁面只負責自己的內容，共用區塊放這裡（同事的建議做法） -->
    <div class="layout">
        <div class="layout__header">
            <LayoutHeader :coins="userCoins" />
        </div>

        <main class="layout__page">
            <slot />
        </main>

        <div class="layout__footer">
            <LayoutFooter />
        </div>
    </div>
</template>

<script setup lang="ts">
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
