// Header 現在是收起來還是顯示
// 外框（layouts/default.vue）負責判斷，黏頂的分類列要跟著讓位，兩邊要看同一份（為什麼用 store：見 ADR 0003）

export const useLayoutHeaderStore = defineStore('layout-header', () => {
    // State
    const isHidden = ref(false);
    // 往上滑、或電腦把滑鼠移到最上面：Header 不整條出現，改把 logo 與縮小的金幣、頭像放進分類列
    const isCompact = ref(false);

    // Actions
    function hide() {
        isHidden.value = true;
        isCompact.value = false;
    }

    function reveal() {
        isHidden.value = false;
        isCompact.value = false;
    }

    // Header 正開著時往上滑也走這裡：要一起收起來，不然完整 Header 與縮小版會同時在畫面上
    function showCompact() {
        isHidden.value = true;
        isCompact.value = true;
    }

    return {
        hide,
        isCompact,
        isHidden,
        reveal,
        showCompact,
    };
});
