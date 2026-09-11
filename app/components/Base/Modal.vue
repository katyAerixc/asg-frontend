<template>
    <!-- 送到 Nuxt 內建的 #teleports 容器：彈窗才不會被祖先的 transform / backdrop-filter 影響，
         那些屬性會讓 position: fixed 改成貼著祖先而不是螢幕 -->
    <Teleport to="#teleports">
        <div
            class="base-modal"
            @click.self="$emit('close')"
        >
            <div
                :aria-labelledby="titleId"
                aria-modal="true"
                class="base-modal__panel"
                role="dialog"
                :style="{
                    '--modal-gap': gap,
                    '--modal-gap-pc': gapPc,
                    '--modal-h': height,
                    '--modal-h-pc': heightPc,
                    '--modal-w-pc': widthPc,
                }"
            >
                <header class="base-modal__head">
                    <h2
                        :id="titleId"
                        class="base-modal__title"
                    >
                        {{ title }}
                    </h2>

                    <button
                        :aria-label="$t('common.close')"
                        class="base-modal__close i-sp-close"
                        type="button"
                        @click="$emit('close')"
                    />
                </header>

                <!-- 中間內容由使用它的人填 -->
                <slot />

                <!-- 底部按鈕區；沒放東西時整個不佔位 -->
                <footer
                    v-if="$slots.footer"
                    class="base-modal__foot"
                >
                    <slot name="footer" />
                </footer>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
// Define props, models and emits
// 每個 prop 都收字串（例如 '650px'），不給就吃 CSS 的預設值：
//   height / heightPc = 高度、widthPc = 電腦版寬度、gap / gapPc = 內部區塊間距。
// 不做 size="large" 這種開關：來第三種尺寸時這支不用改。
// ⚠️ 必須由 prop 傳進來、不能讓用的人在自己的 scoped CSS 設——
//    這支的根節點是 <Teleport>，父層的 class 與 scope id 都傳不進來。
withDefaults(
    defineProps<{
        gap?: string;
        gapPc?: string;
        height?: string;
        heightPc?: string;
        title: string;
        widthPc?: string;
    }>(),
    {
        gap: undefined,
        gapPc: undefined,
        height: undefined,
        heightPc: undefined,
        widthPc: undefined,
    },
);

const emit = defineEmits<{ close: [] }>();

// State
// 每個彈窗要有自己的 id，同頁開兩個才不會讓 aria-labelledby 指到同一個標題
const titleId = `base-modal-title-${useId()}`;

// Functions
// 按 Esc 也關得掉，跟會員選單同一套操作習慣
function closeOnEscape(event: KeyboardEvent) {
    if (event.key === 'Escape') emit('close');
}

// Hooks
onMounted(() => {
    window.addEventListener('keydown', closeOnEscape);
});

onUnmounted(() => {
    window.removeEventListener('keydown', closeOnEscape);
});
</script>

<style scoped lang="scss">
// 全部數值來自 Figma 屬性面板（她 2026-09-10 提供 14 張截圖）
// Figma Interactions：彈窗用 Dissolve（淡入）、Linear、100ms
@keyframes dissolve {
    from {
        opacity: 0;
    }
}

.base-modal {
    position: fixed;
    z-index: 100;
    inset: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: var(--corner-3);

    // Figma Rectangle 212：蓋滿全螢幕的黑 80%
    background-color: var(--color-black-80);

    animation: dissolve 0.1s linear;

    // Figma Frame 1558（H5）：360 x 400 固定高、內距 Corner-3、Gap 40、圓角 Corner-5、1px 白框
    &__panel {
        display: flex;
        flex-direction: column;
        gap: var(--modal-gap, 40px);

        width: 360px;
        max-width: 100%;

        // 高度是「內容的事」，不是「殼的事」：用的人傳 height / height-pc 進來，
        // 這支不用為了新尺寸改動。沒傳就吃預設：手機 400、電腦內容撐開
        height: var(--modal-h, 400px);
        max-height: 100%;
        padding: var(--corner-3);
        border: 1px solid var(--color-neutral-10);
        border-radius: var(--corner-5);

        background: var(--bg-popup);
        backdrop-filter: blur(50px);
        box-shadow: var(--shadow-popup);
    }

    &__head {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;

        padding-bottom: var(--corner-2);

        // Figma Rectangle 603：標題下方 1px 分隔線，寬度剛好等於內容區
        &::after {
            content: '';

            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;

            height: 1px;

            background: var(--line-popup);
        }
    }

    // Figma：Inter 30 / 700 / 白。行高留 140%，中文以外的語言才不會被裁到
    &__title {
        margin: 0;

        font-size: 30px;
        font-weight: 700;
        line-height: 140%;
        color: var(--color-neutral-10);
    }

    // Figma icon/01：18 x 18，貼在標題列右端
    &__close {
        cursor: pointer;

        position: absolute;
        right: 0;

        width: 18px;
        height: 18px;
        padding: 0;
        border: 0;

        color: var(--color-neutral-10);

        background-color: currentcolor;

        transition: opacity 0.2s;

        @media (hover: hover) {
            &:hover {
                opacity: 0.7;
            }
        }
    }

    &__foot {
        display: flex;
        justify-content: center;
    }

    // 系統設定「減少動態效果」的人直接跳出來，不做淡入
    @media (prefers-reduced-motion: reduce) {
        animation: none;
    }

    // 電腦版：放大到 600、內距加大、高度改回內容撐開
    @media (width >= 600px) {
        &__panel {
            gap: var(--modal-gap-pc, var(--modal-gap, 40px));
            width: var(--modal-w-pc, 600px);
            height: var(--modal-h-pc, auto);
            padding: 25px;
        }
    }
}
</style>
