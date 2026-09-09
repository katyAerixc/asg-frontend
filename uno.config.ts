import { resolve } from 'node:path';

import { FileSystemIconLoader } from '@iconify/utils/lib/loader/node-loaders';
import {
    defineConfig,
    presetIcons,
    presetWind4,
    transformerDirectives,
} from 'unocss';

export default defineConfig({
    presets: [
        presetWind4({ preflights: { reset: true } }),
        // SVG 圖示不做成 Vue 組件，直接放 app/assets/images/icon/
        // 用法：<span class="i-sp-search" />（sp = 專案自訂前綴）
        presetIcons({
            collections: {
                sp: FileSystemIconLoader(
                    resolve(import.meta.dirname, './app/assets/images/icon'),
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
    shortcuts: {
        'bg-base': 'bg-center bg-cover bg-no-repeat',
        'flex-middle': 'flex items-center justify-center',
        'h-s-screen': 'h-100svh',
        'w-s-screen': 'w-100svw',
        'wh-s-screen': 'h-s-screen w-s-screen',
    },
    transformers: [transformerDirectives()],
});
