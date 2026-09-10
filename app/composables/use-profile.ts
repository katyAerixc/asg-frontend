// 帳號與暱稱：Header 顯示、選單顯示、變更暱稱彈窗都讀同一份
// 之後接 API 只要改這一支
const ACCOUNT = 'Asg_00012';

const nickname = ref('Rin Chen');

// 彈窗開關：開關鈕在選單裡，彈窗本體掛在 Header 上，兩邊要看同一份
const isNicknameEditorOpen = ref(false);

export function useProfile() {
    // Functions
    function closeNicknameEditor() {
        isNicknameEditorOpen.value = false;
    }

    function openNicknameEditor() {
        isNicknameEditorOpen.value = true;
    }

    function updateNickname(next: string) {
        nickname.value = next.trim();
    }

    return {
        account: ACCOUNT,
        closeNicknameEditor,
        isNicknameEditorOpen,
        nickname,
        openNicknameEditor,
        updateNickname,
    };
}
