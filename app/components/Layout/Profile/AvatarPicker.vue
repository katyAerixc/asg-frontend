<template>
    <BaseModal
        :title="$t('profile.avatarTitle')"
        @close="$emit('close')"
    >
        <ul class="avatar-picker__list">
            <li
                v-for="item in avatars"
                :key="item.id"
            >
                <button
                    :aria-label="$t('profile.avatarAlt', { n: item.id })"
                    :aria-pressed="item.id === pickedId"
                    class="avatar-picker__item"
                    :class="{ 'avatar-picker__item--picked': item.id === pickedId }"
                    type="button"
                    @click="pickedId = item.id"
                >
                    <img
                        alt=""
                        class="avatar-picker__img"
                        :src="item.image"
                    >

                    <!-- 藍色打勾＝現在正在用的那顆（不是剛點的那顆） -->
                    <span
                        v-if="item.id === currentId"
                        class="avatar-picker__check"
                    >
                        <span class="avatar-picker__check-icon i-sp-check" />
                    </span>
                </button>
            </li>
        </ul>

        <template #footer>
            <BaseButton
                :disabled="!hasChanged"
                @click="confirm"
            >
                {{ $t('common.confirm') }}
            </BaseButton>
        </template>
    </BaseModal>
</template>

<script setup lang="ts">
// Emits
import { AVATARS } from '@/stores/user';

const emit = defineEmits<{ close: [] }>();

// Store
const userStore = useUserStore();
const { currentAvatarId: currentId } = storeToRefs(userStore);
const { selectAvatar } = userStore;
const avatars = AVATARS;

// State
// 點選只先記在這裡，按了「確認」才真的換掉——中途關掉彈窗等於放棄
const pickedId = ref(currentId.value);

// Computed properties
// 沒改就不能按確認（Figma 有 btn/disabled 這個狀態）
const hasChanged = computed(() => pickedId.value !== currentId.value);

// Functions
function confirm() {
    selectAvatar(pickedId.value);
    emit('close');
}
</script>

<style scoped lang="scss">
// 只留頭像網格；遮罩/面板/標題/X/按鈕都在 BaseModal 與 BaseButton
// 全部數值來自 Figma 屬性面板（她 2026-09-10 提供 14 張截圖）
.avatar-picker {
    &__list {
        display: grid;

        // Figma MB 頭像區：一排 4 顆、左右上下都間距 15、整塊置中靠上（她 2026-09-15 定照 Figma）
        grid-template-columns: repeat(4, 60px);
        flex: 1;
        gap: var(--corner-3);
        place-content: start center;

        margin: 0;
        padding: 0;

        list-style: none;
    }

    // Figma：H5 60 x 60 圓形。未選 1px Primary/20；選中 2px 橘框 + 外白光暈
    // 外框用 box-shadow 不用 border：框不會把圖擠小，光暈也才長得出來
    &__item {
        cursor: pointer;

        position: relative;

        display: block;

        width: 60px;
        max-width: 100%;
        padding: 0;
        border: 0;
        border-radius: var(--corner-full);

        background: none;

        // H5 的未選外框是 Primary/20，PC 是白——設計稿兩邊確實不同
        box-shadow: 0 0 0 1px var(--color-primary-20);

        transition: box-shadow 0.25s ease;

        &--picked {
            box-shadow:
                0 0 0 2px var(--color-yellow-20),
                var(--shadow-avatar-active);
        }

        // 只有真的有滑鼠的裝置才做 hover；手機沒有滑鼠，點完 :hover 會黏著不放
        @media (hover: hover) {
            // 滑過就先亮起來，告訴人「這顆點得下去」
            &:hover {
                box-shadow:
                    0 0 0 1px var(--color-primary-20),
                    var(--shadow-avatar-active);
            }

            // 已選中的那顆滑過時仍要保住橘框，所以連 :hover 一起寫，權重才壓得過上面那條
            &--picked:hover {
                box-shadow:
                    0 0 0 2px var(--color-yellow-20),
                    var(--shadow-avatar-active);
            }
        }
    }

    &__img {
        display: block;

        aspect-ratio: 1;
        width: 100%;
        border-radius: var(--corner-full);

        object-fit: cover;
    }

    // Figma：H5 20 x 20 藍圓 + 1px 白框 + 外陰影，壓在頭像右下角
    &__check {
        position: absolute;
        right: 0;
        bottom: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        width: 20px;
        height: 20px;
        border: 1px solid var(--color-neutral-10);
        border-radius: var(--corner-full);

        background: var(--bg-check);
        box-shadow: var(--shadow-check);
    }

    // 勾勾本身是白的，疊在上面那顆藍圓上
    &__check-icon {
        width: 18px;
        height: 18px;
        color: var(--color-neutral-10);
        background-color: currentcolor;
    }

    // 電腦版：5 欄、頭像 80、清單限寬 460 置中
    @media (width >= 600px) {
        &__list {
            grid-template-columns: repeat(5, 80px);
            gap: var(--corner-3); // Figma PC：間距 15
            align-self: center;
            max-width: 460px;
        }

        &__item {
            width: 80px;
            box-shadow: 0 0 0 1px var(--color-neutral-10);

            &--picked {
                box-shadow:
                    0 0 0 3px var(--color-yellow-20),
                    var(--shadow-avatar-active);
            }

            @media (hover: hover) {
                &:hover {
                    box-shadow:
                        0 0 0 1px var(--color-neutral-10),
                        var(--shadow-avatar-active);
                }

                &--picked:hover {
                    box-shadow:
                        0 0 0 3px var(--color-yellow-20),
                        var(--shadow-avatar-active);
                }
            }
        }

        &__check {
            width: 24px;
            height: 24px;
        }

        &__check-icon {
            width: 22px;
            height: 22px;
        }
    }
}
</style>
