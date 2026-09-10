<template>
    <nuxt-loading-indicator />
    <nuxt-layout>
        <nuxt-page />
    </nuxt-layout>
</template>

<script setup lang="ts">
// Composables
// 主題與語系要在全站最外層還原，選單元件是 v-if 的，沒打開就不會執行
const { restoreTheme } = useTheme();
const { restoreLocale } = useLocale();

// Lifecycle hooks
onMounted(() => {
    restoreTheme();
    restoreLocale();
});
</script>
