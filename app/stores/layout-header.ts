// Header 現在是收起來還是顯示
// 外框（layouts/default.vue）負責判斷，黏頂的分類列要跟著讓位，兩邊要看同一份（為什麼用 store：見 ADR 0003）

export const useLayoutHeaderStore = defineStore('layout-header', () => {
    // State
    const isHidden = ref(false);
    // 🧪 給設計師比較的版本（網址 ?header=ours）：往上滑時不整條出現，改把金幣、頭像縮小放進分類列
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

    function showCompact() {
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
