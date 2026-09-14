<template>
    <!-- ⚠️ 整張卡不要加 role="button"：那會讓讀螢幕軟體把卡片內容全當裝飾略過，
         只剩 aria-label 那一句。滑鼠點整張都開，鍵盤與讀螢幕走下面 ⓘ 那顆真按鈕 -->
    <article
        class="game-card"
        @click="openGameDetail(game)"
    >
        <!-- 大圖區：正方形，比下方玻璃塊窄一點（Figma 360 : 390） -->
        <div class="game-card__media">
            <img
                :alt="game.name"
                class="game-card__img"
                :src="game.image"
            >

            <!-- 標籤（NEW / HOT / HIGH） -->
            <div
                v-if="game.tags.length"
                class="game-card__tags"
            >
                <BaseTag
                    v-for="tag in game.tags"
                    :key="tag"
                    :type="tag"
                />
            </div>
        </div>

        <!-- 玻璃塊 -->
        <div class="game-card__info">
            <div class="game-card__head">
                <img
                    :alt="$t('lobby.card.thumb', { name: game.name })"
                    class="game-card__thumb"
                    :src="game.image"
                >
                <div class="game-card__text">
                    <!-- 名稱與 ⓘ 同一行，描述才能佔滿整行（到 ⓘ 底下） -->
                    <div class="game-card__name-row">
                        <h3 class="game-card__name">
                            {{ game.name }}
                        </h3>
                        <button
                            :aria-label="$t('lobby.detail.open', { name: game.name })"
                            class="game-card__i"
                            type="button"
                            @click.stop="openGameDetail(game)"
                        >
                            <span class="game-card__i-icon i-sp-info" />
                        </button>
                    </div>
                    <p class="game-card__desc">
                        {{ game.description }}
                    </p>
                </div>
            </div>

            <hr class="game-card__divider">

            <div class="game-card__stats">
                <div class="game-card__stat">
                    <span class="game-card__stat-label">{{ $t('lobby.card.volatilityLabel') }}</span>
                    <span class="game-card__stat-value">{{ $t(`lobby.volatility.${game.volatility}`) }}</span>
                </div>
                <div
                    class="game-card__stat game-card__stat--rtp"
                    :class="rtpClass"
                >
                    <span class="game-card__stat-label">RTP</span>
                    <span class="game-card__stat-value">
                        {{ game.rtp }}
                        <span
                            v-if="game.rtpTrend"
                            class="game-card__arrow"
                            :class="`i-sp-trend-${game.rtpTrend}`"
                        />
                    </span>
                </div>
                <div class="game-card__stat">
                    <span class="game-card__stat-label">{{ $t('lobby.card.maxMultiplier') }}</span>
                    <span class="game-card__stat-value">{{ game.maxMultiplier }}</span>
                </div>
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import type { Game } from '@/types/game';

// Define props, models and emits
const props = defineProps<{ game: Game }>();

// Variables
const { openGameDetail } = useGameDetail();

// Computed properties
// 紅＝漲 up ↗、綠＝跌 down ↘（亞洲習慣）；箭頭用 i-sp-trend-up / i-sp-trend-down
const rtpClass = computed(() => ({
    'game-card__stat--down': props.game.rtpTrend === 'down',
    'game-card__stat--up': props.game.rtpTrend === 'up',
}));
</script>

<style scoped lang="scss">
// 屬性順序照 stylelint-config-clean-order：定位 → 排版 → 盒模型 → 文字 → 外觀，群組間空一行
// Figma：卡片 390 × 451、大圖 360×360（1:1）
// 圖比玻璃塊窄，兩側各縮 15px；玻璃塊底部比圖底再往下 91px（451 − 360）
$img-ratio: calc(360 / 390 * 100%);
$below-img: calc(91 / 390 * 100%); // % 的 padding 是以寬度換算，所以能等比縮放

// 滑入時圖片放大：一路放到 1.14 就停，不回彈也不縮回（她 2026-09-09 看影片後指定）
// 搭一層淺淺的模糊：移動途中最糊，到位就完全清晰
@keyframes img-pop {
    0% {
        transform: scale(1);
        filter: blur(0);
    }

    45% {
        transform: scale(1.11);
        filter: blur(1.5px); // 移動途中，淺淺一層
    }

    100% {
        transform: scale(1.2);
        filter: blur(0); // 到位就完全清晰
    }
}

// RTP 那格的呼吸感：2 秒一次來回，最大放到 1.06 倍（她 2026-09-09 說 1.03 太小）
@keyframes rtp-breathe {
    0%,
    100% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.06);
    }
}

.game-card {
    cursor: pointer;
    position: relative;
    container-type: inline-size; // 讓內部能用 cqw（卡片寬度的百分比）當單位

    // 整張卡片可點（開遊戲介紹）。鍵盤操作時的焦點框換成設計裡的藍
    &:focus-visible {
        outline: 2px solid var(--color-primary-60);
        outline-offset: 4px;
    }

    // 高度不鎖死，由內容撐開（玻璃塊文字變多時往下長，不會蓋住圖片）

    // 大圖區：置中、比玻璃塊窄
    // overflow: hidden 讓圖片放大時被裁在外框內，外框尺寸不變
    &__media {
        position: relative;

        overflow: hidden;

        width: $img-ratio;
        margin: 0 auto;
        border-radius: var(--corner-3);
    }

    &__img {
        display: block;

        aspect-ratio: 1 / 1.12; // 她 2026-09-09 修正（原本以為是 1:1）
        width: 100%;
        border-radius: var(--corner-3);

        object-fit: cover;

        // 滑鼠離開時：平順收回，跟放大同樣的 0.3 秒
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    // 標籤：距大圖左上角留一點白；左上/右下圓角 15px、白邊、漸層、陰影（照 Figma）
    &__tags {
        position: absolute;
        top: var(--corner-1);
        left: var(--corner-1);

        display: flex;
        gap: 4px;
    }

    // 玻璃塊：貼齊卡片底部，高度佔卡片固定比例（Figma 154/451 ≈ 34%）
    // 玻璃塊：正常排版 + 負的上邊距往上蓋。蓋住的量固定，所以圖片永遠露出 74%；
    // 高度不設限，文字變多時往「下」長，不會多吃圖片
    &__info {
        position: relative;
        z-index: 1;

        display: flex;
        flex-direction: column;
        gap: clamp(4px, 2cqw, 10px);

        margin-top: -26.9%; // 往上蓋圖片固定量（% 的 margin 以容器寬度換算，會等比縮放）
        padding: clamp(12px, 4cqw, 15px);
        border-radius: var(--corner-3);

        // 第一段是「還沒 hover 的白框」：0 寬、全透明，這樣 hover 時才能平滑長出來
        box-shadow:
            0 0 0 0 var(--color-white-0),
            var(--shadow-game);

        transition: box-shadow 0.35s cubic-bezier(0.4, 0, 0.2, 1);

        // 底色與霧化獨立成一層,不跟文字擠在同一層
        // 2026-09-09 她回報:偶爾整塊只剩模糊、文字沒出現。原因是霧化與文字同層時
        // 瀏覽器可能只畫完霧化就沒接著畫文字。分層之後兩邊各自繪製,不會互相影響
        &::before {
            content: '';

            position: absolute;
            z-index: -1;
            inset: 0;

            border-radius: inherit;

            background: var(--bg-game);
            backdrop-filter: blur(25px);
        }
    }

    &__head {
        display: flex;
        gap: 10px;
        align-items: center;
    }

    // 縮圖：60×60、白邊 1px、圓角 10px（照 Figma）
    &__thumb {
        display: none; // 手機版沒有縮圖
        flex-shrink: 0;

        width: 60px;
        height: 60px;
        border: 1px solid var(--color-primary-10);
        border-radius: var(--corner-2);

        object-fit: cover;
    }

    &__text {
        flex: 1;
        min-width: 0;
    }

    &__name-row {
        display: flex;
        gap: 8px;
        align-items: center;
        justify-content: space-between;
    }

    // 名稱與描述：手機電腦都固定同一個字級（她 2026-09-09 定，原本是跟著卡片寬度縮）
    &__name {
        font-size: 18px;
        font-weight: 700;
        color: var(--color-neutral-80);
    }

    &__desc {
        overflow: hidden;

        font-size: 14px;
        font-weight: 300;
        color: var(--color-neutral-80);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // 整張卡片都能點（她 2026-09-11 指定），這顆 ⓘ 是給鍵盤與讀螢幕用的真按鈕，
    // 所以要先把瀏覽器預設外觀洗掉，看起來還是跟原本的小圖示一樣
    &__i {
        cursor: pointer;

        display: flex;
        flex-shrink: 0;

        padding: 0;
        border: 0;

        background: transparent;

        &:focus-visible {
            border-radius: var(--corner-1);
            outline: 2px solid var(--color-primary-60);
            outline-offset: 2px;
        }
    }

    &__i-icon {
        width: 16px;
        height: 16px;
        color: var(--color-neutral-80);
    }

    // 上下多留一點白（外層 gap 之外再加），卡片變小時跟著縮
    &__divider {
        height: 1px;
        margin: clamp(4px, 1.5cqw, 6px) 0;
        border: 0;
        background: var(--line-divider);
    }

    // 統計格
    &__stats {
        display: flex;
        gap: 10px;
    }

    &__stat {
        display: none; // 手機版只留 RTP
        flex: 1;
        flex-direction: column;
        gap: 4px;
        align-items: center;

        min-width: 0; // 允許被壓縮，裡面的文字才切得掉（不加的話會把卡片撐開）
        padding: 4px 0;
        border-radius: var(--corner-2);

        background: var(--color-primary-opacity-6010);

        // 中間 RTP 那格：背景搬到 ::before 這層，只讓背景呼吸，文字與箭頭不動
        &--rtp {
            position: relative;
            z-index: 0;

            display: flex;
            flex-direction: row;
            justify-content: center;

            // 左右只留 4px：手機上這格要塞「RTP + 數值 + 箭頭」，內距太寬會把文字擠掉
            padding: 4px;

            background: none;

            // 這層就是「會呼吸的背景」，躲在文字後面（z-index: -1）
            &::before {
                content: '';

                position: absolute;
                z-index: -1;
                inset: 0;

                border-radius: inherit;

                background: var(--color-primary-opacity-6010);

                animation: rtp-breathe 2s ease-in-out infinite;
            }
        }

        // 漲跌的顏色也要畫在 ::before 那層，才會跟著呼吸
        &--up::before {
            background: linear-gradient(
                293deg,
                var(--color-red-opacity-2060) 35.34%,
                var(--color-red-opacity-2020) 100%
            );
            box-shadow: 0 0 10px 0 var(--shadow-dark-20);
        }

        &--down::before {
            background: linear-gradient(
                293deg,
                var(--color-green-opacity-2060) 35.34%,
                var(--color-green-opacity-2020) 100%
            );
            box-shadow: 0 0 10px 0 var(--shadow-dark-20);
        }
    }

    // 手機：小字 12/300、數值 16/700
    // 多語系：字太長時切掉加「…」，不換行也不把卡片撐高（做法同上方的 __desc）
    &__stat-label {
        overflow: hidden;

        max-width: 100%;

        // 14px 是上限（375 以上就是 14）；比 375 窄才等比例縮，320 時約 11.6px
        font-size: clamp(10px, 8.4cqw, 14px);
        font-weight: 300;
        color: var(--color-primary-20);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    &__stat-value {
        overflow: hidden;
        display: inline-flex;
        gap: 4px;
        align-items: center;

        min-width: 0;
        max-width: 100%;

        // 18px 是上限（375 以上就是 18）；比 375 窄才等比例縮，320 時約 14.9px
        font-size: clamp(13px, 10.8cqw, 18px);
        font-weight: 700;
        color: var(--color-primary-10);
        white-space: nowrap;

        // 320 這種極窄畫面：數值與箭頭之間不留間距，把那 4px 讓給文字（她 2026-09-10 定）
        @media (width < 375px) {
            gap: 0;
        }
    }

    // 25px 是上限（375 以上就是 25）；比 375 窄才等比例縮，320 時約 20.8px
    // flex-shrink: 0 讓它照 clamp 算出的尺寸走，不會被旁邊的文字擠扁
    &__arrow {
        flex-shrink: 0;
        width: clamp(16px, 15.1cqw, 25px);
        height: clamp(16px, 15.1cqw, 25px);
    }

    // 只有真的有滑鼠的裝置才做 hover；手機沒有滑鼠，點完 :hover 會黏著不放
    @media (hover: hover) {
        // 滑入整張卡：圖片放大（被 __media 的 overflow 裁住，外框尺寸不變）
        // 停在 1.2；進場那 0.3 秒由 img-pop 接手（快速放大 + 途中淺淺的模糊）
        &:hover &__img {
            transform: scale(1.2);
            animation: img-pop 0.3s cubic-bezier(0.2, 0.8, 0.3, 1);
        }

        // 滑入整張卡：玻璃塊往「外」長出一圈白框（沒有 inset 就是畫在外面）
        // 用 box-shadow 不占空間，所以不會把旁邊的卡片推開
        &:hover &__info {
            box-shadow:
                0 0 0 2px var(--color-primary-10),
                var(--shadow-game);
        }
    }

    // 使用者若在系統開了「減少動態效果」，一律不動（W3C 無障礙要求）
    @media (prefers-reduced-motion: reduce) {
        &__img,
        &__info {
            transition: none;
        }

        &__img,
        &__stat--rtp::before {
            animation: none;
        }
    }

    // 電腦版
    @media (width >= 960px) {
        &__thumb {
            display: block;
        }

        &__stat {
            display: flex;

            &--rtp {
                flex-direction: column;
                padding: 4px 0;
            }
        }

        // 電腦：字級已由上方的 clamp 接手（14 / 18），這裡只剩字重不同
        &__stat-value {
            font-weight: 500;
        }
    }
}
</style>
