<template>
    <nuxt-loading-indicator />
    <nuxt-layout>
        <nuxt-page />
    </nuxt-layout>
</template>

<script setup lang="ts">
// Variables
// 中日韓泰各有自己的字型：Inter 沒有這些字，不載的話會退回系統字，每台電腦長不一樣。
// ⚠️ 不能一次全載：日文漢字與中文漢字字形不同，全放進 font-family 會被前面的字型搶去顯示
const CJK_FONTS: Partial<Record<LocaleCode, string>> = {
    'ja': 'Noto+Sans+JP',
    'ko': 'Noto+Sans+KR',
    'th': 'Noto+Sans+Thai',
    'zh-CN': 'Noto+Sans+SC',
    'zh-TW': 'Noto+Sans+TC',
};

// Composables
const { locale } = useLocale();

// 每頁自動產生 hreflang（告訴 Google 這頁有哪 7 種語言版本）、canonical（正本網址）、og:locale
// lang 交給下面的 useHead 自己設，dir 全站都是左到右不用
const localeHead = useLocaleHead({
    dir: false,
    lang: false,
    seo: true,
});

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
            rel: 'stylesheet' as const,
        },
    ];
});

// <html lang> 跟著目前語言走（例：泰文頁 → lang="th"）
// 讀螢幕軟體靠它選發音、Google 靠它判斷語言、CSS 的 :lang() 也靠它
useHead({
    htmlAttrs: { lang: locale },
    link: () => [
        ...fontLinks.value,
        ...localeHead.value.link ?? [],
    ],
    meta: () => localeHead.value.meta ?? [],
});
</script>
