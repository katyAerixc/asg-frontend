// 開站時建好一個 $fetch 實例掛在 nuxtApp.$api，libs/api/*.ts 透過 useApi() 拿
// 檔名照公司規範：<四位數字>.<名稱>.ts，數字小的先跑

import type { $Fetch } from 'nitropack/types';

import { createApi } from '@/libs/api';

// 讓 useNuxtApp().$api 有型別（Nuxt 不會自動從 provide 推出來）
declare module '#app' {
    interface NuxtApp {
        $api: $Fetch;
    }
}

export default defineNuxtPlugin(() => {
    const { apiBase } = useRuntimeConfig().public;

    return { provide: { api: createApi(apiBase) } };
});
