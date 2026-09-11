<template>
    <nuxt-loading-indicator />
    <nuxt-layout>
        <nuxt-page />
    </nuxt-layout>
</template>

<script setup lang="ts">
// Variables
// 中日韓泰各有自己的字型：Inter 沒有這些字，不載的話會退回系統字，每台電腦長不一樣。
// ⚠️ 不能一次全載——日文漢字與中文漢字字形不同，全放進 font-family 會被前面的搶去顯示。
// 所以只載「當前語言」需要的那一份；英文不用（Inter 就夠）。
const CJK_FONTS: Partial<Record<LocaleCode, string>> = {
    'ja': 'Noto+Sans+JP',
    'ko': 'Noto+Sans+KR',
    'th': 'Noto+Sans+Thai',
    'zh-CN': 'Noto+Sans+SC',
    'zh-TW': 'Noto+Sans+TC',
};

// Composables
const { locale } = useLocale();

// Computed properties
// Google Fonts 對這些字型會自動切成很多小片（unicode-range），
// 瀏覽器只下載頁面真的用到的那幾片，不會整包吃下來
const fontLinks = computed(() => {
    const family = CJK_FONTS[locale.value];

    if (!family) return [];

    return [
        {
            crossorigin: 'anonymous' as const,
            href: `https://fonts.googleapis.com/css2?family=${family}:wght@300;500;700&display=swap`,
            rel: 'stylesheet',
        },
    ];
});

useHead({ link: fontLinks });
</script>
