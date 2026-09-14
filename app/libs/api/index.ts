// API 呼叫的統一入口（ADR 0004）
// 網址、逾時、共同的錯誤處理只寫在這裡；每個功能的 API 各自一個檔（game.ts、support.ts）。
// ⚠️ libs/ 不會自動匯入，用的地方要自己 import

import type { $Fetch } from 'nitropack/types';

// 後端還沒接上，先照她的對接模板留好三個攔截點；有加密需求時填在標 🔲 的地方
export function createApi(baseURL: string): $Fetch {
    return $fetch.create({
        baseURL,
        onRequest() {
            // 🔲 加密 body、帶 token：等後端規格確定再填（不猜）
        },

        onResponse() {
            // 🔲 解密、後端自訂錯誤碼（例如 code !== 100000）：等後端規格確定再填
        },

        onResponseError({ response }) {
            // 🔲 認證失效要踢出（她的模板：code 900403）：等後端規格確定再填
            console.error('[API]', response.status, response._data);
        },

        timeout: 15000,
    });
}

// 在 libs/api/*.ts 裡拿實例用這個（plugins/0001.api.ts 開站時建好）
export function useApi(): $Fetch {
    return useNuxtApp().$api;
}

// 要回假資料還是打真的後端：由 .env 的 NUXT_PUBLIC_USE_MOCK 決定，頁面與 store 完全不用知道
export function useMock(): boolean {
    return useRuntimeConfig().public.useMock;
}
