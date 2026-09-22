<template>
    <div class="game-play">
        <div class="game-play__bg" />

        <picture class="game-play__screen">
            <source
                media="(width >= 960px)"
                :srcset="playPc"
            >
            <img
                class="game-play__img"
                :alt="game?.name ?? ''"
                :src="playH5"
            >
        </picture>

        <button
            class="game-play__close"
            type="button"
            :aria-label="$t('common.close')"
            @click="close"
        >
            <span class="game-play__close-icon i-sp-close" />
        </button>
    </div>
</template>

<script setup lang="ts">
import playH5 from '@/assets/images/game/play-h5.jpg';
import playPc from '@/assets/images/game/play-pc.jpg';

// 遊戲畫面整頁都是遊戲，不要 Header
definePageMeta({ layout: false });

// Variables
const localePath = useLocalePath();
const route = useRoute();
const router = useRouter();
const {
    games,
    ready,
} = useGames();

// Computed properties
const game = computed(() => games.value.find((item) => item.id === Number(route.params.id)));

useHead({
    htmlAttrs: { 'data-fullscreen': '' },
    title: () => game.value ? `${game.value.name} | ASG` : 'ASG',
});

// 網址的 id 找不到遊戲 → 404。要先等資料回來再判斷，伺服器才會回 404 狀態碼（不然 Google 會當成正常頁收錄）
await ready;
if (!game.value) {
    throw createError({
        statusCode: 404,
        statusMessage: 'Page Not Found',
    });
}

// Functions
// 從大廳點進來就回上一頁（大廳有 keepalive，捲到哪裡還在）；直接開網址進來的沒有上一頁，改回首頁
function close() {
    if (window.history.state?.back) router.back();
    else navigateTo(localePath('/'));
}
</script>

<style scoped lang="scss">
.game-play {
    position: fixed;
    z-index: 1; // 蓋過 body 的背景光暈
    inset: 0;

    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    background-color: var(--bg-page);

    // 手機：遊戲後面鋪一張模糊的同一張圖，上下露出來的地方才不是一片空
    // ⚠️ 暫定：Figma 用的是另一張已經模糊好的圖，模糊值是估的；接上遊戲後這層可能拿掉
    &__bg {
        position: absolute;
        inset: 0;
        transform: scale(1.1); // 放大一點，模糊後邊緣才不會透出底色

        background: url('@/assets/images/game/play-h5.jpg') center / cover no-repeat;
        filter: blur(20px);
    }

    // ⚠️ 還沒接上遊戲，先用截圖頂著；後端給網址後，__screen 換成 <iframe :src="遊戲網址">
    // 外框不佔位：圖片直接當頁面的子元素，寬度 100% 才是整頁寬
    &__screen {
        display: contents;
    }

    // 寬度以「整排滿版」為主，畫面太矮時改成以高度為準，整張遊戲才看得完
    &__img {
        position: relative;

        display: block;

        aspect-ratio: 390 / 692;
        width: min(100%, calc(100svh * 390 / 692));

        object-fit: cover;
        box-shadow: 0 0 20px 0 var(--color-black-50);
    }

    &__close {
        cursor: pointer;

        position: absolute;
        top: 27px;
        right: var(--corner-3);

        display: flex;
        align-items: center;
        justify-content: center;

        width: 34px;
        height: 34px;
        padding: 0;
        border: 1px solid var(--color-neutral-10);
        border-radius: var(--corner-full);

        color: var(--color-neutral-10);

        background-color: var(--color-black-50);

        transition: opacity var(--motion-hover);

        @media (hover: hover) {
            &:hover {
                opacity: 0.7;
            }
        }
    }

    &__close-icon {
        width: 14px;
        height: 14px;
    }

    // 電腦：截圖本身就含左右模糊背景，直接鋪滿
    @media (width >= 960px) {
        &__bg {
            display: none;
        }

        &__img {
            position: absolute;
            inset: 0;

            width: 100%;
            height: 100%;

            box-shadow: none;
        }

        &__close {
            top: var(--corner-3);
            width: 40px;
            height: 40px;
        }

        &__close-icon {
            width: 18px;
            height: 18px;
        }
    }
}
</style>
