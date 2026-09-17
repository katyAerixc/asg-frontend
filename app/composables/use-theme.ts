/**
 * 深淺主題
 *
 * 做什麼：把選到的主題寫進 <html data-theme="..." class="...">，整站的 CSS 變數就會跟著換。
 *
 * 實際幹活的是 @nuxtjs/color-mode（設定在 nuxt.config.ts 的 colorMode）：
 *   - 存在 cookie（不是 localStorage）→ server 渲染時就知道要哪個顏色，首屏不會閃
 *   - preference 預設 'system'：跟著使用者的系統設定；系統沒說就用 fallback 'dark'
 *
 * 這一支只是薄薄一層包裝，讓選單那邊不用直接碰套件的 API。
 */

export type Theme = 'dark' | 'light';

export function useTheme() {
    const colorMode = useColorMode();

    // Computed properties
    // colorMode.value 是「實際生效」的主題（preference 是 'system' 時會解析成 dark 或 light）
    const theme = computed<Theme>(() => colorMode.value === 'light' ? 'light' : 'dark');

    // Functions
    // 改 preference 而不是 value：value 是唯讀的結果，preference 才是使用者的選擇
    function applyTheme(next: Theme) {
        colorMode.preference = next;
    }

    return {
        applyTheme,
        theme,
    };
}
