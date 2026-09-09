// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        head: {
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
        watcher: 'builder',
    },
    hooks: {
        'prepare:types': function ({ tsConfig }) {
            delete tsConfig.compilerOptions?.paths?.['~'];
            delete tsConfig.compilerOptions?.paths?.['~/*'];
        },
    },
    kikiutilsNuxt: { enabledModules: { security: true } },
    modules: ['@kikiutils/nuxt'],
    nitro: { preset: process.env.NITRO_PRESET || 'node-cluster' },
    security: {
        headers: {
            contentSecurityPolicy: {
                'script-src-attr': [
                    `'unsafe-hashes'`,
                    `'sha256-F1noxsLOnJhyRSgc0zu5JgzoLjG2BBMaXaSG24k2mRM='`,
                ],
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
        optimizeDeps: { include: [] },
        server: { allowedHosts: (process.env.DEV_VITE_SERVER_ALLOWED_HOSTS || '').split(',') },
    },
});
