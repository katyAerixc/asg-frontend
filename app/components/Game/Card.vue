<template>
    <!-- ⚠️ 整張卡不要加 role="button"：那會讓讀螢幕軟體把卡片內容全當裝飾略過，
         只剩 aria-label 那一句。滑鼠點整張都開，鍵盤與讀螢幕走下面 ⓘ 那顆真按鈕 -->
    <article
        class="game-card"
        @click="openGameDetail(game)"
    >
        <!-- 大圖區：正方形，比下方玻璃塊窄一點 -->
        <div class="game-card__media">
            <img
                :alt="game.name"
                class="game-card__img"
                :src="game.image"
            >
            <!-- Figma item=hover 的放大版圖。Figma 用 DISSOLVE（交叉淡化）換狀態，不是把圖放大，
                 所以這裡疊第二張已放大的圖，滑入時兩張互換透明度。
                 同一個 src 不會多下載一次；它只是裝飾，讀螢幕軟體跳過 -->
            <img
                alt=""
                aria-hidden="true"
                class="game-card__img game-card__img--hover"
                :src="game.image"
            >

            <!-- 標籤（NEW / HOT / HIGH） -->
            <div
                v-if="game.tags.length"
                class="game-card__tags"
            >
                <GameTag
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

            <!-- 三格數據跟遊戲介紹彈窗共用 GameStat，只換 variant -->
            <div class="game-card__stats">
                <GameStat
                    :label="$t('lobby.card.volatilityLabel')"
                    :value="$t(`lobby.volatility.${game.volatility}`)"
                    variant="card"
                />
                <GameStat
                    highlight
                    label="RTP"
                    :trend="game.rtpTrend"
                    :value="game.rtp"
                    variant="card"
                />
                <GameStat
                    :label="$t('lobby.card.maxMultiplier')"
                    :value="game.maxMultiplier"
                    variant="card"
                />
            </div>
        </div>
    </article>
</template>

<script setup lang="ts">
import type { Game } from '@/types/game';

// Define props, models and emits
defineProps<{ game: Game }>();

// Variables
const { open: openGameDetail } = useGameDetailStore();
</script>

<style scoped lang="scss">
// 屬性順序照 stylelint-config-clean-order：定位 → 排版 → 盒模型 → 文字 → 外觀，群組間空一行
// Figma 電腦：卡片寬 390、大圖 360 × 380（兩側各縮 15）、玻璃塊蓋住圖 100
// Figma 手機：卡片寬 172、大圖 156 × 200（兩側各縮 8）、玻璃塊蓋住圖 60（圖底 200、玻璃塊 Top 140）
$img-ratio: calc(360 / 390 * 100%);
$below-img: calc(91 / 390 * 100%); // % 的 padding 是以寬度換算，所以能等比縮放

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

        width: calc(156 / 172 * 100%); // 手機；電腦版在最下面換成 $img-ratio
        margin: 0 auto;
        border-radius: var(--corner-3);

        transition: box-shadow var(--motion-hover-game);
    }

    &__img {
        display: block;

        aspect-ratio: 156 / 200; // 手機 Figma Image 156 × 200；電腦版在最下面換成 360 / 380
        width: 100%;
        border-radius: var(--corner-3);

        object-fit: cover;

        // Figma 是 DISSOLVE（交叉淡化）：兩張圖互換透明度，不是把同一張放大
        transition: opacity var(--motion-hover-game);
    }

    // 放大版：疊在原圖正上方，平常透明
    // 倍率照 Figma item=hover：圖 360 × 380 → 444 × 468，以中心放大 ＝ 1.233
    &__img--hover {
        position: absolute;
        inset: 0;
        transform: scale(1.233);
        opacity: 0;
    }

    // 標籤：距大圖左上角留一點白；左上/右下圓角 15px、白邊、漸層、陰影（照 Figma）
    &__tags {
        position: absolute;
        top: var(--corner-1);
        right: var(--corner-1);
        left: var(--corner-1);

        display: flex;
        flex-wrap: wrap; // Figma Frame 11386：塞不下就換行
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

        // 手機 Figma MB/Game/block：間距 10、內距 15（卡片 172 寬時剛好；更窄的手機等比縮，最小 4／12）
        gap: clamp(4px, calc(10 / 172 * 100cqw), 10px);

        // 往上蓋圖片固定量（% 的 margin 以容器寬度換算，會等比縮放）：手機蓋 60，電腦版在最下面換成 100
        margin-top: calc(-60 / 172 * 100%);
        padding: clamp(12px, calc(15 / 172 * 100cqw), var(--corner-3)); // 最大值＝Figma Corner/Corner-3
        border-radius: var(--corner-3);

        // 前兩段是「還沒 hover 的白框與外陰影」：全透明，這樣 hover 時才能平滑長出來
        // 模糊值先寫成跟 hover 一樣（10px），過渡時只有顏色在變，比較滑順
        box-shadow:
            0 0 0 0 var(--color-white-0),
            0 0 10px 0 var(--color-white-0),
            var(--shadow-game-bg-default);

        transition: box-shadow var(--motion-hover-game);

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

        // 用 neutral-10 不用 primary-10：淺色主題不覆寫 neutral，框線兩個主題都是白（她 2026-09-14 指定，同標籤的做法）
        border: 1px solid var(--color-neutral-10);
        border-radius: var(--corner-2);

        object-fit: cover;
    }

    // Figma Frame 12：名稱列與描述之間手機 4、電腦 5
    &__text {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-1);

        min-width: 0;
    }

    // Figma Frame 10704：名稱與 ⓘ 之間 5
    &__name-row {
        display: flex;
        gap: 5px;
        align-items: center;
        justify-content: space-between;
    }

    // 名稱與描述：各斷點固定一個字級，不跟著卡片寬度縮（她 2026-09-09 定）
    // 字級照 Figma：名稱手機 18／電腦 20，描述手機 14／電腦 16
    &__name {
        font-size: var(--font-size-18);
        font-weight: var(--font-weight-bold);
        line-height: var(--line-height-figma);
        color: var(--color-neutral-80);
    }

    &__desc {
        overflow: hidden;

        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        line-height: var(--line-height-figma);
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

    // Figma icon/01：手機 22 × 22、電腦 24 × 24（圖案在正中間，SVG 本身就含留白）
    &__i-icon {
        width: 22px;
        height: 22px;
        color: var(--color-neutral-80);
    }

    // 上下不另外留白：Figma 手機／電腦都只靠玻璃塊自己的間距（10 / 15）
    &__divider {
        height: 1px;
        margin: 0;
        border: 0;
        background: var(--line-2);
    }

    // 統計格
    &__stats {
        display: flex;
        gap: 10px;
    }

    // 只有真的有滑鼠的裝置才做 hover；手機沒有滑鼠，點完 :hover 會黏著不放
    @media (hover: hover) {
        // 滑入整張卡：原圖淡出、放大版淡入（Figma DISSOLVE）。
        // 放大版被 __media 的 overflow 裁住，所以外框尺寸不變，不會把旁邊卡片推開
        &:hover &__img {
            opacity: 0;
        }

        &:hover &__img--hover {
            opacity: 1;
        }

        // Figma item=hover：大圖那層多一道外陰影 0 0 10 黑 50%
        &:hover &__media {
            box-shadow: 0 0 10px 0 var(--shadow-dark-50);
        }

        // 滑入整張卡（Figma item=default → item=hover）：
        // ①往外長 1px 白框 ②多一道 0 0 10 外陰影 ③三層內陰影換成位移較大的 game/bg_act
        // 用 box-shadow 不占空間，所以不會把旁邊的卡片推開
        &:hover &__info {
            box-shadow: var(--shadow-game-hover), var(--shadow-game-bg-act);
        }
    }

    // 使用者若在系統開了「減少動態效果」，一律不動（W3C 無障礙要求）
    @media (prefers-reduced-motion: reduce) {
        &__img,
        &__media,
        &__info {
            transition: none;
        }
    }

    // 電腦版
    @media (width >= 960px) {
        &__media {
            width: $img-ratio;
        }

        // Figma Image 360 × 380（她 2026-09-15 定照 Figma，原本 1:1.12）
        &__img {
            aspect-ratio: 360 / 380;
        }

        // Figma 圖高 380、玻璃塊 Top 280，蓋住 100
        // Figma Frame 10684：玻璃塊裡「頭像列／分隔線／三格數據」的間距是 15（不是玻璃塊自己的 10）
        &__info {
            gap: var(--corner-3);
            margin-top: calc(-100 / 390 * 100%);
            padding: clamp(12px, 4cqw, var(--corner-3));
        }

        &__text {
            gap: 5px;
        }

        &__name {
            font-size: var(--font-size-20);
        }

        &__desc {
            font-size: var(--font-size-16);
        }

        &__i-icon {
            width: 24px;
            height: 24px;
        }

        &__thumb {
            display: block;
        }
    }
}
</style>
