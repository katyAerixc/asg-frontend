<template>
    <!-- 送到 #teleports：祖先有 transform / backdrop-filter 時，fixed 會貼著祖先而不是螢幕 -->
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

                <slot />

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

// 彈窗開著時背景頁面不能捲，關掉後停在原位
useBodyScrollLock();

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

    // 彈窗比畫面高時，整個彈窗一起捲（她 2026-09-15 選 A）：遮罩本身當捲動容器
    // 置中改用面板的 margin: auto——用 align-items: center 的話，太高時上面會被切掉、捲不回去
    overflow-y: auto;
    overscroll-behavior: contain; // 捲到底不要連帶捲動後面的頁面
    display: flex;
    justify-content: center;

    padding: var(--corner-3);

    // Figma Rectangle 212：蓋滿全螢幕的黑 80%
    background-color: var(--color-black-80);

    animation: dissolve 0.1s linear;

    // Figma Frame 1558（H5）：360 x 400 固定高、內距 Corner-3、Gap 40、圓角 Corner-5、1px 白框
    &__panel {
        // 現在用的間距（手機／電腦不同），標題區要拿來算自己的下距
        --modal-gap-now: var(--modal-gap, 40px);

        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        gap: var(--modal-gap-now);

        width: 360px;
        max-width: 100%;

        // 高度是「內容的事」，不是「殼的事」：用的人傳 height / height-pc 進來，
        // 這支不用為了新尺寸改動。沒傳就吃預設：手機 400、電腦內容撐開
        // 不設 max-height：畫面太矮時讓面板照原本高度，交給遮罩捲（原本壓在畫面內會把內容擠出去、看不到也按不到）
        height: var(--modal-h, 400px);
        margin: auto;
        padding: var(--corner-3);
        border-radius: var(--corner-5);

        background: var(--bg-popup);
        backdrop-filter: blur(25px); // Figma bg：blur 25
        outline: 1px solid var(--color-neutral-10); // Figma 框線畫在內側（INSIDE）、不佔寬度，border 會讓內容少 2px
        outline-offset: -1px;
        box-shadow: var(--shadow-bg);
    }

    // Figma Frame 11208：標題區手機 47、電腦 52（標題 → 15 → 1px 線）
    // 標題區到內容 Figma 是 20，比面板的 gap 小：用負的下距把 gap 扣回 20
    &__head {
        position: relative;

        display: flex;
        align-items: center;
        justify-content: center;

        height: 47px;
        margin-bottom: calc(var(--corner-4) - var(--modal-gap-now));
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

    // Figma：手機 26、電腦 30，都是 700 / 白。行高留 140%，中文以外的語言才不會被裁到
    &__title {
        margin: 0;

        font-size: var(--font-size-26);
        font-weight: var(--font-weight-bold);
        line-height: 1.4;
        color: var(--color-neutral-10);
    }

    // Figma icon/01：18 x 18，貼在標題列右端
    &__close {
        cursor: pointer;

        position: absolute;
        right: 0;

        width: 24px;
        height: 24px;
        padding: 0;
        border: 0;

        color: var(--color-neutral-10);

        background-color: currentcolor;

        // Figma icon：點擊區手機 24（電腦 30），裡面的叉 14.4（電腦 18），圖比框小所以用 mask-size 縮、置中
        mask-position: center;
        mask-size: 14.4px 14.4px;

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

    // 電腦版：放大到 600、高度改回內容撐開；內距跟手機一樣 Corner-3（Figma Frame 1556／1557／1558）
    @media (width >= 600px) {
        &__panel {
            --modal-gap-now: var(--modal-gap-pc, var(--modal-gap, 40px));

            width: var(--modal-w-pc, 600px);
            height: var(--modal-h-pc, auto);
        }

        &__head {
            height: 52px;
        }

        &__title {
            font-size: var(--font-size-30);
        }

        &__close {
            width: 30px;
            height: 30px;
            mask-size: 18px 18px;
        }
    }
}
</style>
