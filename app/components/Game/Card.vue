<template>
    <article class="game-card">
        <NuxtLink
            class="game-card__media"
            :aria-label="$t('lobby.card.play', { name: game.name })"
            :title="$t('lobby.card.play', { name: game.name })"
            :to="localePath(`/game/${game.id}`)"
        >
            <img
                class="game-card__img"
                :alt="game.name"
                :src="game.image"
                :title="game.name"
            >
            <img
                class="game-card__img game-card__img--hover"
                aria-hidden="true"
                :alt="game.name"
                :src="game.image"
                :title="game.name"
            >

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
        </NuxtLink>

        <div
            class="game-card__info"
            @click="openGameDetail(game)"
        >
            <div class="game-card__head">
                <img
                    class="game-card__thumb"
                    :alt="$t('lobby.card.thumb', { name: game.name })"
                    :src="game.image"
                    :title="$t('lobby.card.thumb', { name: game.name })"
                >
                <div class="game-card__text">
                    <div class="game-card__name-row">
                        <h3 class="game-card__name">
                            {{ game.name }}
                        </h3>
                        <button
                            class="game-card__i"
                            type="button"
                            :aria-label="$t('lobby.detail.open', { name: game.name })"
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
                <GameStat
                    variant="card"
                    :label="$t('lobby.card.volatilityLabel')"
                    :value="$t(`lobby.volatility.${game.volatility}`)"
                />
                <GameStat
                    label="RTP"
                    variant="card"
                    :trend="game.rtpTrend"
                    :value="game.rtp"
                    highlight
                />
                <GameStat
                    variant="card"
                    :label="$t('lobby.card.maxMultiplier')"
                    :value="game.maxMultiplier"
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
const localePath = useLocalePath();
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

    // 高度不鎖死，由內容撐開（玻璃塊文字變多時往下長，不會蓋住圖片）

    // 大圖區：置中、比玻璃塊窄
    // overflow: hidden 讓圖片放大時被裁在外框內，外框尺寸不變
    // 是進遊戲的連結（<a>），要自己設成 block 才吃得到寬度
    &__media {
        position: relative;

        overflow: hidden;
        display: block;

        width: calc(156 / 172 * 100%); // 手機；電腦版在最下面換成 $img-ratio
        margin: 0 auto;
        border-radius: var(--corner-3);

        transition: box-shadow var(--motion-hover-game);

        // 鍵盤操作時的焦點框換成設計裡的藍
        &:focus-visible {
            outline: 2px solid var(--color-primary-60);
            outline-offset: 4px;
        }
    }

    &__img {
        display: block;

        aspect-ratio: 156 / 200; // 電腦版在最下面換成 360 / 380
        width: 100%;
        border-radius: var(--corner-3);

        object-fit: cover;

        // Figma 是 DISSOLVE：放大版淡入蓋上去，不是把同一張放大（原圖保持不透明，見下方 hover）
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

    // 標籤：距大圖左上角留一點白
    &__tags {
        position: absolute;
        top: var(--corner-1);
        right: var(--corner-1);
        left: var(--corner-1);

        display: flex;
        flex-wrap: wrap;
        gap: 4px;
    }

    // ⚠️ 玻璃塊不要加 role="button"：讀螢幕軟體會把裡面的內容全當裝飾略過；鍵盤操作走 ⓘ 那顆按鈕
    // 玻璃塊：正常排版 + 負的上邊距往上蓋。蓋住的量固定，所以圖片永遠露出 74%；
    // 高度不設限，文字變多時往「下」長，不會多吃圖片
    &__info {
        position: relative;
        z-index: 1;

        display: flex;
        flex-direction: column;

        // 卡片 172 寬時剛好 10／15；更窄的手機等比縮，最小 4／12
        gap: clamp(4px, calc(10 / 172 * 100cqw), 10px);

        // 往上蓋圖片固定量（% 的 margin 以容器寬度換算，會等比縮放）：手機蓋 60，電腦版在最下面換成 100
        margin-top: calc(-60 / 172 * 100%);
        padding: clamp(12px, calc(15 / 172 * 100cqw), var(--corner-3));
        border-radius: var(--corner-3);

        // 第一段是「還沒 hover 的白框」：全透明，hover 時才能平滑長出來
        // 第二段外陰影平常就有（Figma 平常狀態沒畫，設計師後來要求跟圖交界處要有陰影），跟 hover 同一組數值
        box-shadow:
            0 0 0 0 var(--color-white-0),
            0 0 10px 0 var(--color-shadow-dark-50),
            var(--shadow-game-bg-default);

        transition: box-shadow var(--motion-hover-game);

        // 底色與霧化獨立成一層,不跟文字擠在同一層
        // 偶爾整塊只剩模糊、文字沒出現：霧化與文字同層時
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

    &__thumb {
        display: none; // 手機版沒有縮圖
        flex-shrink: 0;

        width: 60px;
        height: 60px;

        // 用 neutral-10 不用 primary-10：淺色主題不覆寫 neutral，框線兩個主題都是白（同標籤的做法）
        border: 1px solid var(--color-neutral-10);
        border-radius: var(--corner-2);

        object-fit: cover;
    }

    &__text {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-1);

        min-width: 0;
    }

    &__name-row {
        display: flex;
        gap: 5px;
        align-items: center;
        justify-content: space-between;
    }

    // 名稱與描述：各斷點固定一個字級，不跟著卡片寬度縮
    &__name {
        font-size: var(--font-size-18);
        font-weight: var(--font-weight-bold);
        color: var(--color-neutral-80);
    }

    &__desc {
        // 「…」要裁左右；上下不裁，聲調、泰文上下標才不會被切
        overflow: clip visible;

        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
        color: var(--color-neutral-80);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // 整張卡片都能點，這顆 ⓘ 是給鍵盤與讀螢幕用的真按鈕，
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

    // SVG 本身就含留白，圖案在正中間
    &__i-icon {
        width: 22px;
        height: 22px;
        color: var(--color-neutral-80);
    }

    // 上下不另外留白：只靠玻璃塊自己的 gap
    // Figma 分隔線高 0、不佔排版高度 → 用 -1px 下距抵掉；手機左右各內縮 1，電腦填滿
    &__divider {
        height: 1px;
        margin: 0 0 -1px;
        border: 0;
        background: var(--line-2);

        @media (width < 960px) {
            margin: 0 1px -1px;
        }
    }

    // 統計格
    &__stats {
        display: flex;
        gap: 10px;
    }

    @media (hover: hover) {
        // 滑入整張卡：放大版淡入蓋住原圖（Figma DISSOLVE）。
        // 🚨 原圖不要同時淡出：兩張一起變透明時，一半的瞬間深色底會透出來、畫面暗一下
        // 放大版被 __media 的 overflow 裁住，所以外框尺寸不變，不會把旁邊卡片推開
        &:hover &__img--hover {
            opacity: 1;
        }

        &:hover &__media {
            box-shadow: 0 0 10px 0 var(--color-shadow-dark-50);
        }

        // 滑入整張卡：
        // ①往外長 1px 白框 ②多一道 0 0 10 外陰影 ③三層內陰影換成位移較大的 game/bg_act
        // 用 box-shadow 不占空間，所以不會把旁邊的卡片推開
        &:hover &__info {
            box-shadow: var(--shadow-game-hover), var(--shadow-game-bg-act);
        }
    }

    // 手機沒有 hover：改成按下去時變化（Figma item=active）
    // 圖框 156 → 164 時比例一起換成 164 / 200，高度不變，下面的玻璃塊不會跳
    @media (hover: none) and (width < 960px) {
        &__media {
            transition: box-shadow var(--motion-press);
        }

        &__img {
            transition: opacity var(--motion-press);
        }

        &__info {
            transition: box-shadow var(--motion-press);
        }

        &:active &__media {
            width: calc(164 / 172 * 100%);
            box-shadow: 0 0 5px 0 var(--color-shadow-dark-50);
        }

        // 原圖不淡出，理由同上面 hover
        &:active &__img {
            aspect-ratio: 164 / 200;
        }

        &:active &__img--hover {
            opacity: 1;
        }

        &:active &__info {
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

        &__img {
            aspect-ratio: 360 / 380;
        }

        // Figma 圖高 380、玻璃塊 Top 280，蓋住 100
        // 電腦版玻璃塊裡的間距是 15（手機是 10）
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
