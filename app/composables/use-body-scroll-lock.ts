/**
 * 鎖住背後頁面的捲動
 *
 * ⚠️ 不能取名 useScrollLock：VueUse 也有一個（@kikiutils/nuxt 會自動匯入），執行時會叫到 VueUse 那支、什麼都不做，
 *    型別檢查卻顯示是這支，完全看不出來（2026-09-15 踩過）
 *
 * 做什麼：彈窗打開時背景不能捲，關掉後停在原本的位置（她 2026-09-15 定）。
 * 做法：在 <html> 加 data-scroll-locked（CSS 在 index.scss：overflow: hidden）。
 *   - 用 data 屬性不用 class：<html> 的 class 由深淺主題套件管理，不去跟它搶
 *   - 不用「body 改 position: fixed」那招：那招要自己記位置再捲回去，關掉時容易閃一下
 *   - 可能同時開兩個彈窗（例如客服裡再開別的），所以用計數：全部關掉才解鎖
 */

let lockCount = 0;

export function useBodyScrollLock() {
    // Hooks
    onMounted(() => {
        lockCount += 1;
        document.documentElement.dataset.scrollLocked = '';
    });

    onUnmounted(() => {
        lockCount = Math.max(0, lockCount - 1);
        if (!lockCount) delete document.documentElement.dataset.scrollLocked;
    });
}
