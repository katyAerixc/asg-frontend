import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';

import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders';
import {
    defineConfig,
    presetIcons,
    presetWind4,
    transformerDirectives,
} from 'unocss';

const iconDir = resolve(import.meta.dirname, './app/assets/images/icon');

export default defineConfig({
    presets: [
        presetWind4({ preflights: { reset: true } }),
        // SVG 圖示不做成 Vue 組件，直接放 app/assets/images/icon/
        // 用法：<span class="i-sp-search" />（sp = 專案自訂前綴）
        // 尺寸一律由元件的 CSS 決定：拿掉最外層 <svg> 的 width/height，不然會被抄成沒單位的無效 CSS（width: 24）
        // ⚠️ 只動最外層標籤，裡面 <rect> 等圖形的 width/height 是畫圖用的，刪了圖會壞
        presetIcons({
            collections: {
                sp: FileSystemIconLoader(
                    iconDir,
                    (svg) => svg.replace(/<svg\b[^>]*>/, (tag) => tag.replace(/\s(?:width|height)="[^"]*"/g, '')),
                ),
            },
        }),
    ],
    rules: [
        [
            /^fs-(\d+(\.\d+)?(px|rem))$/,
            (matches) => ({ 'font-size': matches[1] }),
        ],
    ],
    // UnoCSS 是開站前掃原始碼文字產生 CSS，`i-sp-${name}` 這種組出來的它看不到，圖示會無聲消失
    // 所以圖示資料夾裡每一張都直接產生，變數寫法也正常（2026-09-14 RTP 箭頭消失後加）
    safelist: readdirSync(iconDir)
        .filter((file) => file.endsWith('.svg'))
        .map((file) => `i-sp-${file.replace(/\.svg$/, '')}`),
    shortcuts: {
        'bg-base': 'bg-center bg-cover bg-no-repeat',
        'flex-middle': 'flex items-center justify-center',
        'h-s-screen': 'h-100svh',
        'w-s-screen': 'w-100svw',
        'wh-s-screen': 'h-s-screen w-s-screen',
    },
    transformers: [transformerDirectives()],
});
