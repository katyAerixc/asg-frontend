import avatarImage from '@/assets/images/ui/avatar.png';

export interface AvatarOption {
    id: number;
    image: string;
}

// 設計稿是 11 顆頭像。Figma 裡 11 顆都是同一張 girl1.png 佔位，
// 這裡照樣先共用 avatar.png；之後拿到 11 張真圖，改成逐一 import 即可
const AVATAR_COUNT = 11;
const AVATARS: AvatarOption[] = Array.from({ length: AVATAR_COUNT }, (_, index) => ({
    id: index + 1,
    image: avatarImage,
}));

// 放在模組層級：Header 與彈窗共用同一份，換了頭像兩邊一起變
const currentId = ref(1);

// 彈窗開關也放這裡：開關鈕在選單裡，彈窗本體掛在 Header 上，兩邊要看同一份
const isPickerOpen = ref(false);

export function useAvatar() {
    // Computed properties
    // 找不到就退回第一顆（AVATARS 是固定長度 11，不會真的落到 fallback，但型別上要給得出值）
    const currentAvatar = computed<AvatarOption>(() => {
        const found = AVATARS.find((item) => item.id === currentId.value);

        return found ?? {
            id: 1,
            image: avatarImage,
        };
    });

    // Functions
    function closePicker() {
        isPickerOpen.value = false;
    }

    function openPicker() {
        isPickerOpen.value = true;
    }

    function selectAvatar(id: number) {
        currentId.value = id;
    }

    return {
        avatars: AVATARS,
        closePicker,
        currentAvatar,
        currentId,
        isPickerOpen,
        openPicker,
        selectAvatar,
    };
}
