/**
 * 深淺主題
 *
 * 做什麼：把選到的主題寫進 <html data-theme="...">，整站的 CSS 變數就會跟著換；
 *        同時記在瀏覽器裡，下次打開還是同一個主題。
 *
 * ⚠️ 目前只有深色的顏色值。淺色的變數要等 Figma Modes 的數值進來後，
 *    在 app/assets/scss/index.scss 補一段 `[data-theme='light'] { ... }` 覆寫即可，
 *    這支不用改。
 */

const STORAGE_KEY = 'asg-theme';

export type Theme = 'dark' | 'light';

// 放在函式外面：全站共用同一份狀態，不會每次呼叫就各自為政
const theme = ref<Theme>('dark');

export function useTheme() {
    function applyTheme(next: Theme) {
        theme.value = next;

        // SSG 產生 HTML 時沒有 document，只在瀏覽器端做
        if (import.meta.client) {
            document.documentElement.dataset.theme = next;

            try {
                localStorage.setItem(STORAGE_KEY, next);
            } catch {
                // 無痕模式或關閉儲存時會丟錯，記不住不影響當下切換
            }
        }
    }

    // 首次進站：讀回上次的選擇
    function restoreTheme() {
        if (!import.meta.client) return;

        try {
            const saved = localStorage.getItem(STORAGE_KEY);

            if (saved === 'dark' || saved === 'light') applyTheme(saved);
            else applyTheme(theme.value);
        } catch {
            applyTheme(theme.value);
        }
    }

    return {
        applyTheme,
        restoreTheme,
        theme,
    };
}
