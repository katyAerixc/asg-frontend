import { antfu } from '@antfu/eslint-config';
import { createBaseConfigs } from '@kikiutils/eslint-config/base';
import { createStyleFilesConfigs } from '@kikiutils/eslint-config/style';
import { createVueConfig } from '@kikiutils/eslint-config/vue';

export default antfu(
    {
        formatters: { css: true },
        // pnpm 12 會校驗這個檔，重排 key 會讓 pnpm 跑不動，所以不讓 ESLint 檢查它
        ignores: ['pnpm-workspace.yaml'],
        typescript: true,
        vue: true,
    },
    createBaseConfigs(),
    createStyleFilesConfigs(),
    createVueConfig(),
);
