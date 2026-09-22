// 使用者：帳號、暱稱、頭像，以及「變更頭像」「變更暱稱」兩個彈窗的開關
// Header 顯示、選單顯示、兩個彈窗都讀同一份；之後接 API 只要改這一支
//
// 🚨 不能用 composable 的模組層 ref：SSR 時會被所有使用者共用，A 的暱稱會出現在 B 的畫面

import avatarImage from '@/assets/images/ui/avatar.png';

export interface AvatarOption {
    id: number;
    image: string;
}

// 11 顆頭像先共用 avatar.png 佔位；之後拿到 11 張真圖，改成逐一 import 即可
const AVATAR_COUNT = 11;

// 固定清單不是狀態，放 store 外面（每個請求不用各自建一份）
export const AVATARS: AvatarOption[] = Array.from({ length: AVATAR_COUNT }, (_, index) => ({
    id: index + 1,
    image: avatarImage,
}));

export const useUserStore = defineStore('user', () => {
    // State
    const account = ref('Asg_00012');
    const nickname = ref('Rin Chen');
    const currentAvatarId = ref(1);

    // 彈窗裡改到一半的內容：放 store 才不會跟著彈窗一起不見；null＝沒改過，顯示目前的值
    const draftNickname = ref<null | string>(null);
    const draftAvatarId = ref<null | number>(null);

    // 彈窗開關：開關鈕在選單裡，彈窗本體掛在 Header 上，兩邊要看同一份
    const isAvatarPickerOpen = ref(false);
    const isNicknameEditorOpen = ref(false);

    // Getters
    // 找不到就退回第一顆（AVATARS 是固定長度 11，不會真的落到 fallback，但型別上要給得出值）
    const currentAvatar = computed<AvatarOption>(() => {
        const found = AVATARS.find((item) => item.id === currentAvatarId.value);

        return found ?? {
            id: 1,
            image: avatarImage,
        };
    });

    // Actions
    function closeAvatarPicker() {
        isAvatarPickerOpen.value = false;
    }

    function closeNicknameEditor() {
        isNicknameEditorOpen.value = false;
    }

    function openAvatarPicker() {
        isAvatarPickerOpen.value = true;
    }

    function openNicknameEditor() {
        isNicknameEditorOpen.value = true;
    }

    function selectAvatar(id: number) {
        currentAvatarId.value = id;
        draftAvatarId.value = null;
    }

    function updateNickname(next: string) {
        nickname.value = next.trim();
        draftNickname.value = null;
    }

    return {
        account,
        closeAvatarPicker,
        closeNicknameEditor,
        currentAvatar,
        currentAvatarId,
        draftAvatarId,
        draftNickname,
        isAvatarPickerOpen,
        isNicknameEditorOpen,
        nickname,
        openAvatarPicker,
        openNicknameEditor,
        selectAvatar,
        updateNickname,
    };
});
