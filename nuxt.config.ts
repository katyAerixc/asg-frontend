import { fileURLToPath } from 'node:url';

import { checkAndGetEnvValue } from '@kikiutils/shared/env';

// Constants/Variables
const envValidationSkipped = process.env.SKIP_ENV_VALIDATION === 'true';
// 明確寫 true 才讓搜尋引擎收錄：dev／build 只讀 .local 檔，漏設時要是預設收錄，開發站會被 Google 收進去
const seoIndexingEnabled = process.env.SEO_INDEXING_ENABLED?.trim() === 'true';
// 網站住在子路徑時（例 GitHub Pages 的 /倉庫名/）要在 build 時就設，只靠 runtime 的 NUXT_APP_BASE_URL 烤靜態頁會全部轉址
const appBaseURL = process.env.NUXT_APP_BASE_URL?.trim() || '/';

// i18n：語言檔按功能拆成 6 個，7 種語言各一份（i18n/locales/<語言>/<功能>.json）
// 加字串 → 改對應的功能檔；加語言 → 在 LOCALES 加一行、複製 zh-TW 資料夾。詳見 i18n/README.md
const i18nNamespaces = [
    'common',
    'header',
    'lobby',
    'profile',
    'seo',
    'support',
];

const i18nLocales = [
    {
        code: 'zh-TW',
        name: '繁體中文',
    },
    {
        code: 'zh-CN',
        name: '简体中文',
    },
    {
        code: 'ja',
        name: '日本語',
    },
    {
        code: 'ko',
        name: '한국어',
    },
    {
        code: 'en',
        name: 'English',
    },
    {
        code: 'th',
        name: 'ไทย',
    },
    {
        code: 'vi',
        name: 'Tiếng Việt',
    },
].map((locale) => ({
    ...locale,
    files: i18nNamespaces.map((namespace) => `${locale.code}/${namespace}.json`),
    language: locale.code,
}));

const siteDescription = 'ASG';
const siteName = 'ASG';
const siteTitle = 'ASG';
const siteUrl = (envValidationSkipped ? process.env.NUXT_SITE_URL : checkAndGetEnvValue('NUXT_SITE_URL'))
    ?.trim()
    .replace(/\/+$/, '');

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
    app: {
        baseURL: appBaseURL,
        head: {
            // favicon：.ico 給瀏覽器分頁，.png 給手機加到主畫面
            link: [
                {
                    href: `${appBaseURL}favicon.ico`,
                    rel: 'icon',
                },
                // 這裡貌似與下面PWA會衝突或重複，最後上線或要啟用PWA(也可能最終不啟用)時再處理
                {
                    href: `${appBaseURL}favicon.png`,
                    rel: 'apple-touch-icon',
                },
            ],
            // 頁面沒設標題時的備用名；各頁的標題（seo.title）本身就含品牌名，所以不用 titleTemplate 再補一次
            title: siteTitle,
            // @nuxtjs/seo 預設會在標題後面自動加「| 站名」，關掉，不然會重複
            titleTemplate: '%s',
        },
        keepalive: true,
    },
    build: { transpile: [] },
    colorMode: {
        classSuffix: '',
        dataValue: 'theme',
        fallback: 'dark',
        preference: 'system',
        storage: 'cookie',
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
    i18n: {
        // 正式網址，hreflang 與 canonical 要用它組完整網址；空的不會產生這些標籤
        // 值由 .env 的 NUXT_PUBLIC_I18N_BASE_URL 覆蓋（開發 .env.development.local、上線 .env.production）
        baseUrl: '',
        defaultLocale: 'zh-TW',
        // 依瀏覽器的語系自動選；認不出來（不是我們支援的 7 種）就退回英文
        detectBrowserLanguage: {
            cookieKey: 'asg-locale',
            fallbackLocale: 'en',
            redirectOn: 'root',
            useCookie: true,
        },
        langDir: 'locales',
        locales: i18nLocales,
        strategy: 'prefix_except_default',
    },
    kikiutilsNuxt: {
        autoImportUtils: { '@kikiutils/shared': {} },
        enabledModules: {
            // 交給@nuxtjs/seo處理
            robots: false,
            security: true,
        },
    },
    linkChecker: { enabled: false },
    modules: [
        '@kikiutils/nuxt',
        '@nuxtjs/color-mode',
        // 暫時關閉，最後再決定要開還關
        // '@vite-pwa/nuxt',
        '@nuxtjs/i18n',
        '@nuxtjs/seo',
        '@pinia/nuxt',
    ],
    nitro: {
        // apiBaseURL: '/_api',
        preset: process.env.NITRO_PRESET || 'node-cluster',

        // favicon 放在 app/assets/images/favicon，但要能用 /favicon.ico 這種固定網址抓到
        // （瀏覽器、Google、LINE 都是直接猜根路徑，不會讀 HTML）
        // ⚠️ dir 必須是絕對路徑，寫相對路徑不會生效
        publicAssets: [{ dir: fileURLToPath(new URL('app/assets/images/favicon', import.meta.url)) }],
    },
    ogImage: { enabled: false },
    plugins: [],
    // 暫時關閉，最後再決定要開還關
    // pwa: {
    //     client: { periodicSyncForUpdates: 60 * 60 },
    //     devOptions: { enabled: false },
    //     filename: 'sw.ts',
    //     injectManifest: { globPatterns: [] },
    //     manifest: {
    //         background_color: 'to be fill',
    //         description: siteDescription,
    //         display: 'standalone',
    //         icons: [
    //             {
    //                 sizes: '192x192',
    //                 src: '/icon-192x192.png',
    //                 type: 'image/png',
    //             },
    //             {
    //                 purpose: 'any',
    //                 sizes: '512x512',
    //                 src: '/icon-512x512.png',
    //                 type: 'image/png',
    //             },
    //             {
    //                 purpose: 'maskable',
    //                 sizes: '512x512',
    //                 src: '/icon-maskable-512x512.png',
    //                 type: 'image/png',
    //             },
    //         ],
    //         id: '/',
    //         lang: 'zh-TW',
    //         name: siteName,
    //         scope: '/',
    //         short_name: siteName,
    //         start_url: '/',
    //         theme_color: 'to be fill',
    //     },
    //     registerType: 'prompt',
    //     srcDir: 'service-worker',
    //     strategies: 'injectManifest',
    // },
    // 住在子路徑時 @nuxt/robots 不允許產 robots.txt（根路徑不歸我們管），HTML 的 meta noindex 仍會寫
    robots: {
        disallow: seoIndexingEnabled ? undefined : '/',
        robotsTxt: appBaseURL === '/',
    },
    routeRules: {},
    // 值由 .env 的 NUXT_PUBLIC_* 覆蓋（NUXT_PUBLIC_API_BASE、NUXT_PUBLIC_USE_MOCK）
    runtimeConfig: {
        public: {
            apiBase: '',
            siteUrl,
            // 後端還沒接上，預設回假資料；接上後在 .env.production 加 NUXT_PUBLIC_USE_MOCK=false
            useMock: true,
        },
    },
    schemaOrg: {
        enabled: seoIndexingEnabled,
        identity: {
            '@type': [],
            // TODO: 正確設定
            'logo': `${siteUrl}/favicon.ico`,
            'name': siteName,
            'url': siteUrl,
        },
    },
    security: {
        headers: {
            contentSecurityPolicy: {
                'base-uri': [`'self'`],
                'connect-src': [
                    `'self'`,
                    'https://*.analytics.google.com',
                    'https://*.google-analytics.com',
                    'https://*.googletagmanager.com',
                    'https://fonts.googleapis.com',
                    'https://fonts.gstatic.com',
                    'https://stats.g.doubleclick.net',
                    'https://i.ytimg.com',
                    'https://s.ytimg.com',
                    'https://www.youtube.com',
                    'https://www.youtube-nocookie.com',
                ],
                'default-src': [`'none'`],
                'font-src': [
                    `'self'`,
                    'data:',
                    'https://fonts.gstatic.com',
                ],
                'frame-src': [
                    `'self'`,
                    'https://www.youtube.com',
                    'https://www.youtube-nocookie.com',
                ],
                'img-src': [
                    `'self'`,
                    'blob:',
                    'data:',
                    'https://*.google-analytics.com',
                    'https://*.googletagmanager.com',
                    'https://i.ytimg.com',
                ],
                'manifest-src': [`'self'`],
                'media-src': [`'self'`],
                'script-src': [
                    `'self'`,
                    'https:',
                    `'unsafe-inline'`,
                    `'strict-dynamic'`,
                    `'nonce-{{nonce}}'`,
                ],
                'script-src-attr': [
                    `'unsafe-hashes'`,
                    // @nuxt/image image error marker onerror handler: this.setAttribute('data-error', 1)
                    `'sha256-bwK6T5wZVTANitXbrTsel7kl/PyCjCd/Dq5Qoz3imjM='`,
                    // unplugin-fonts Google Fonts preload 的 onload handler: this.rel='stylesheet'
                    `'sha256-F1noxsLOnJhyRSgc0zu5JgzoLjG2BBMaXaSG24k2mRM='`,
                ],
                'script-src-elem': [
                    `'self'`,
                    `'nonce-{{nonce}}'`,
                    'https://static.cloudflareinsights.com',
                ],
                'style-src': [
                    `'self'`,
                    `'unsafe-inline'`,
                    'https://fonts.googleapis.com',
                ],
                // 🚨 開發時要關：dev server 只有 http，用區網 IP 開會變純文字（localhost 看不出來）
                'upgrade-insecure-requests': process.env.NODE_ENV === 'production',
                'worker-src': [`'self'`],
            },
            crossOriginEmbedderPolicy: false,
            permissionsPolicy: {
                'encrypted-media': [
                    'self',
                    '"https://www.youtube.com"',
                    '"https://www.youtube-nocookie.com"',
                ],
                'fullscreen': [
                    'self',
                    '"https://www.youtube.com"',
                    '"https://www.youtube-nocookie.com"',
                ],
            },
            referrerPolicy: 'strict-origin-when-cross-origin',
        },
    },
    seo: {},
    site: {
        defaultLocale: 'zh-TW',
        description: siteDescription,
        indexable: seoIndexingEnabled,
        name: siteName,
        url: siteUrl,
    },
    sitemap: {
        autoI18n: false,
        cacheMaxAgeSeconds: 900,
        defaultSitemapsChunkSize: false,
        enabled: seoIndexingEnabled,
        minify: process.env.NODE_ENV === 'production',
        // sitemaps: {},
        sortEntries: true,
    },
    ssr: true,
    unfonts: {
        google: {
            // 400、600 是客服頁碼用的
            families: [
                {
                    name: 'Inter',
                    styles: 'wght@300;400;500;600;700',
                },
            ],
        },
        inlineFontFace: false,
    },
    vite: {
        // @kikiutils/nuxt 11.0.0 用 node:path 的 join 組這個 pattern，Windows 會變成反斜線讓 build 失敗
        // 它用 ??= 只在沒設定時才套用，這裡先給正確值它就不會插手
        build: { rollupOptions: { output: { assetFileNames: '_nuxt/[hash].[ext]' } } },
        optimizeDeps: { include: [] },
        server: { allowedHosts: (process.env.DEV_VITE_SERVER_ALLOWED_HOSTS || '').split(',') },
    },
});
