import { fileURLToPath } from 'node:url';

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
            // favicon：.ico 給瀏覽器分頁，.png 給手機加到主畫面
            link: [
                {
                    href: '/favicon.ico',
                    rel: 'icon',
                },
                {
                    href: '/favicon.png',
                    rel: 'apple-touch-icon',
                },
            ],
            title: 'Nuxt Template',
            titleTemplate: '%s｜Nuxt Template',
        },
        keepalive: true,
    },
    compatibilityDate: 'latest',
    css: ['@/assets/scss/index.scss'],
    devServer: {
        host: process.env.DEV_SERVER_HOST,
        port: Number(process.env.DEV_SERVER_PORT) || undefined,
    },
    experimental: {
        asyncContext: true,
        extractAsyncDataHandlers: true,
        typescriptPlugin: true,
    },
    hooks: {
        'prepare:types': function ({ tsConfig }) {
            delete tsConfig.compilerOptions?.paths?.['~'];
            delete tsConfig.compilerOptions?.paths?.['~/*'];
        },
    },
    kikiutilsNuxt: { enabledModules: { security: true } },
    modules: ['@kikiutils/nuxt'],
    nitro: {
        preset: process.env.NITRO_PRESET || 'node-cluster',

        // favicon 放在 app/assets/images/favicon，但要能用 /favicon.ico 這種固定網址抓到
        // （瀏覽器、Google、LINE 都是直接猜根路徑，不會讀 HTML）
        // ⚠️ dir 必須是絕對路徑，寫相對路徑不會生效
        publicAssets: [{ dir: fileURLToPath(new URL('app/assets/images/favicon', import.meta.url)) }],
    },
    security: {
        headers: {
            contentSecurityPolicy: {
                'script-src-attr': [
                    `'unsafe-hashes'`,
                    `'sha256-F1noxsLOnJhyRSgc0zu5JgzoLjG2BBMaXaSG24k2mRM='`,
                ],

                // 🚨 開發時一定要關。這條會把所有 http 資源請求強制升級成 https，
                // 但 dev server 只有 http → CSS 與 JS 全部 SSL 錯誤、畫面變成純文字。
                // 用 localhost 開看不出來（瀏覽器對 localhost 豁免），
                // 用區網 IP（例如手機連 192.168.x.x 測試）才會炸。正式站有 https，照常開。
                'upgrade-insecure-requests': process.env.NODE_ENV === 'production',
            },
        },
    },
    ssr: true,
    unfonts: {
        google: {
            // 設計稿全用 Inter；只載 300 / 500 / 700 三種粗細（設計稿用到的）
            families: [
                {
                    name: 'Inter',
                    styles: 'wght@300;500;700',
                },
            ],
        },
        inlineFontFace: false,
    },
    vite: {
        // @kikiutils/nuxt 11.0.0 用 node:path 的 join 組這個 pattern，Windows 會變成反斜線讓 build 失敗
        // 它用 ??= 只在沒設定時才套用，這裡先給正確值它就不會插手（2026-09-10 實測）
        build: { rollupOptions: { output: { assetFileNames: '_nuxt/[hash].[ext]' } } },
        optimizeDeps: { include: [] },
        server: { allowedHosts: (process.env.DEV_VITE_SERVER_ALLOWED_HOSTS || '').split(',') },
    },
});
