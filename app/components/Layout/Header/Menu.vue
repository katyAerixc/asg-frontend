<template>
    <div class="header-menu">
        <!-- 帳號區：頭像（可更換）+ 帳號/暱稱 + 編輯鉛筆 -->
        <div class="header-menu__account">
            <button
                :aria-label="$t('header.menu.changeAvatar')"
                class="header-menu__avatar"
                type="button"
                @click="openPicker"
            >
                <img
                    alt=""
                    class="header-menu__avatar-img"
                    :src="currentAvatar.image"
                >
                <span class="header-menu__avatar-label">{{ $t('header.menu.change') }}</span>
            </button>

            <dl class="header-menu__profile">
                <div class="header-menu__profile-row">
                    <dt class="header-menu__profile-label">
                        {{ $t('header.menu.account') }}
                    </dt>
                    <dd class="header-menu__profile-value">
                        {{ account }}
                    </dd>
                </div>
                <div class="header-menu__profile-row">
                    <dt class="header-menu__profile-label">
                        {{ $t('header.menu.nickname') }}
                    </dt>
                    <dd class="header-menu__profile-value">
                        {{ nickname }}
                    </dd>
                </div>
            </dl>

            <button
                :aria-label="$t('header.menu.editNickname')"
                class="header-menu__edit i-sp-edit"
                type="button"
                @click="openNicknameEditor"
            />
        </div>

        <!-- 連結列：客服中心 / 聯絡我們 -->
        <button
            v-for="link in LINKS"
            :key="link"
            class="header-menu__row"
            type="button"
            @click="openLink(link)"
        >
            <span class="header-menu__row-label">{{ $t(`header.menu.${link}`) }}</span>
            <span class="header-menu__row-arrow i-sp-arrow-right" />
        </button>

        <!-- 主題切換：深 / 淺 -->
        <div class="header-menu__row">
            <span class="header-menu__row-label">{{ $t('header.menu.theme') }}</span>
            <div class="header-menu__theme">
                <button
                    v-for="item in THEMES"
                    :key="item.value"
                    :aria-pressed="theme === item.value"
                    class="header-menu__theme-btn"
                    :class="{ 'header-menu__theme-btn--active': theme === item.value }"
                    type="button"
                    @click="applyTheme(item.value)"
                >
                    {{ $t(`header.menu.${item.labelKey}`) }}
                </button>
            </div>
        </div>

        <!-- 語系：點了往下展開 7 種語言 -->
        <div class="header-menu__row header-menu__row--lang">
            <span class="header-menu__row-label">{{ $t('header.menu.language') }}</span>

            <div class="header-menu__lang">
                <button
                    :aria-expanded="isLangOpen"
                    class="header-menu__lang-current"
                    :class="{ 'header-menu__lang-current--open': isLangOpen }"
                    type="button"
                    @click="isLangOpen = !isLangOpen"
                >
                    <img
                        alt=""
                        class="header-menu__lang-flag"
                        :src="flagOf(locale)"
                    >
                    <span class="header-menu__lang-name">{{ labelOf(locale) }}</span>
                    <span
                        class="header-menu__lang-caret i-sp-arrow-right"
                        :class="{ 'header-menu__lang-caret--open': isLangOpen }"
                    />
                </button>

                <ul
                    v-if="isLangOpen"
                    class="header-menu__lang-list"
                >
                    <li
                        v-for="lang in LANGUAGES"
                        :key="lang.code"
                    >
                        <button
                            class="header-menu__lang-item"
                            :class="{ 'header-menu__lang-item--active': locale === lang.code }"
                            type="button"
                            @click="selectLang(lang.code)"
                        >
                            <img
                                alt=""
                                class="header-menu__lang-flag"
                                :src="lang.flag"
                            >
                            <span class="header-menu__lang-name">{{ lang.label }}</span>
                        </button>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import flagCn from '@/assets/images/flag/cn.png';
import flagEn from '@/assets/images/flag/en.png';
import flagJp from '@/assets/images/flag/jp.png';
import flagKr from '@/assets/images/flag/kr.png';
import flagTh from '@/assets/images/flag/th.png';
import flagTw from '@/assets/images/flag/tw.png';
import flagVn from '@/assets/images/flag/vn.png';

// Variables
// 連結列：值是翻譯 key（header.menu.*），不是要顯示的字
const LINKS = [
    'support',
    'contact',
];

const THEMES: { labelKey: string; value: Theme }[] = [
    {
        labelKey: 'themeDark',
        value: 'dark',
    },
    {
        labelKey: 'themeLight',
        value: 'light',
    },
];

// 國旗小圖 22 x 22。語言的代碼與名稱來自 nuxt.config 的 LOCALES（單一真相），
// 這裡只補「哪個代碼配哪面旗」，加語言時不用兩邊都改
const FLAGS: Record<string, string> = {
    'en': flagEn,
    'ja': flagJp,
    'ko': flagKr,
    'th': flagTh,
    'vi': flagVn,
    'zh-CN': flagCn,
    'zh-TW': flagTw,
};

const isLangOpen = ref(false);

// 主題與語系的狀態放在 composable，全站共用同一份
const { applyTheme, theme } = useTheme();
const { currentAvatar, openPicker } = useAvatar();
const {
    account,
    nickname,
    openNicknameEditor,
} = useProfile();
const { applyLocale, locale } = useLocale();
const { openSupport } = useSupport();
const { locales } = useI18n();

// Computed properties
// 語言清單直接用 i18n 註冊的那份，順序照 nuxt.config 的 LOCALES
const LANGUAGES = computed(() => locales.value.map((item) => ({
    code: item.code as LocaleCode,
    flag: FLAGS[item.code],
    label: item.name ?? item.code,
})));

// Functions
function flagOf(code: LocaleCode) {
    return FLAGS[code];
}

function labelOf(code: LocaleCode) {
    return LANGUAGES.value.find((lang) => lang.code === code)?.label;
}

// 連結列現在只有客服中心有彈窗；聯絡我們還沒有去處，先不做事
function openLink(link: string) {
    if (link === 'support') openSupport();
}

function selectLang(code: LocaleCode) {
    applyLocale(code);
    isLangOpen.value = false;
}
</script>

<style scoped lang="scss">
// 全部數值來自 Figma 屬性面板（她 2026-09-10 提供 19 張截圖）
.header-menu {
    display: flex;
    flex-direction: column;

    width: 350px;
    padding: var(--corner-2);
    border-radius: var(--corner-4);

    background: var(--bg-normal);
    backdrop-filter: blur(50px);
    box-shadow: var(--shadow-btn);

    // 帳號區：頭像 66 + 帳號/暱稱 + 鉛筆
    &__account {
        position: relative;

        display: flex;
        gap: var(--corner-2);
        align-items: center;

        // 左右內距跟下面的連結列一致，鉛筆才會跟那些箭頭對在同一條直線上
        padding: 0 var(--corner-2) var(--corner-2);

        // Figma 圖七：暱稱下方是漸層線（白 50 → 90 → 50），跟卡片分隔線同一條
        &::after {
            content: '';

            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;

            height: 1px;

            background: var(--line-divider);
        }
    }

    // Figma：66 × 66、1px 邊框 Primary/20
    &__avatar {
        cursor: pointer;

        position: relative;

        overflow: hidden;
        flex-shrink: 0;

        width: 66px;
        height: 66px;
        border: 1px solid var(--color-primary-20);
        border-radius: 50%;

        background: none;
    }

    &__avatar-img {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }

    // Figma：黑 80% 的橫帶壓在頭像下緣，「更換」14px / 300 / 白
    &__avatar-label {
        position: absolute;
        right: 0;
        bottom: 0;
        left: 0;

        display: flex;
        align-items: center;
        justify-content: center;

        height: 24px;

        font-size: 14px;
        font-weight: 300;
        line-height: 100%;
        color: var(--color-neutral-10);

        background: var(--color-black-80);
    }

    &__profile {
        display: flex;
        flex: 1;
        flex-direction: column;
        gap: var(--corner-2);

        min-width: 0;
    }

    &__profile-row {
        display: flex;
        gap: var(--corner-2);
        align-items: center;
    }

    // Figma：18px / 300 / Primary/20
    &__profile-label {
        flex-shrink: 0;

        font-size: 18px;
        font-weight: 300;
        line-height: 100%;
        color: var(--color-primary-20);
    }

    // Figma：18px / 500 / Primary/10
    &__profile-value {
        overflow: hidden;

        font-size: 18px;
        font-weight: 500;
        line-height: 100%;
        color: var(--color-primary-10);
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // Figma：22 × 22
    &__edit {
        cursor: pointer;

        flex-shrink: 0;

        // Figma：鉛筆對齊「暱稱」那一行，不是整塊置中
        align-self: flex-end;

        width: 22px;
        height: 22px;

        // 抵消 __account 的 padding-bottom，讓鉛筆底邊剛好貼齊文字區底邊
        margin-bottom: var(--corner-2);
        border: 0;

        color: var(--color-primary-10);

        // UnoCSS 的圖示是「鏤空遮罩」，看得到的顏色來自 background-color，不能設 transparent
        background-color: currentcolor;

        transition: opacity 0.2s;

        // 只有真的有滑鼠的裝置才做 hover；手機沒有滑鼠，點完 :hover 會黏著不放
        @media (hover: hover) {
            &:hover {
                opacity: 0.7;
            }
        }
    }

    // Figma：高固定 64、左右內距 Corner-2、下框線 1px 白 30%
    &__row {
        cursor: pointer;

        display: flex;
        gap: var(--corner-2);
        align-items: center;
        justify-content: space-between;

        height: 64px;
        padding: 0 var(--corner-2);
        border: 0;
        border-bottom: 1px solid var(--color-white-30);

        text-align: left;

        background: none;

        transition: background-color 0.2s;

        // 最後一列（語系）不畫線
        &:last-child {
            border-bottom: 0;
        }

        &--lang {
            cursor: default;
            position: relative;
        }

        // 只有真的有滑鼠的裝置才做 hover；手機沒有滑鼠，點完 :hover 會黏著不放
        @media (hover: hover) {
            &:hover {
                background-color: rgb(255 255 255 / 6%);
            }

            // 語系那列不是連結，滑過不變色；寫在後面才壓得過上面那條
            &--lang:hover {
                background: none;
            }
        }
    }

    // Figma：18px / 500 / Primary/10
    &__row-label {
        font-size: 18px;
        font-weight: 500;
        line-height: 100%;
        color: var(--color-primary-10);
    }

    // Figma：22 × 22
    &__row-arrow {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        color: var(--color-primary-10);
    }

    // Figma：104 × 38 Hug、圓角 full、內距 Corner-1、底色 Primary/90、input 陰影
    &__theme {
        display: flex;
        gap: 0;
        align-items: center;

        padding: var(--corner-1);
        border-radius: var(--corner-full);

        background: var(--bg-input);
        box-shadow: var(--shadow-input);
    }

    // Figma：未選 18px / 300 / Primary/40；選中 18px / 700 / Primary/10 + 藍底 30% + 內光
    &__theme-btn {
        cursor: pointer;

        display: flex;
        align-items: center;
        justify-content: center;

        height: 30px;
        padding: var(--corner-1) var(--corner-3);
        border: 0;
        border-radius: var(--corner-full);

        font-size: 18px;
        font-weight: 300;
        line-height: 100%;
        color: var(--color-primary-40);

        background-color: transparent;

        transition:
            color 0.2s,
            background-color 0.2s,
            box-shadow 0.2s;

        &--active {
            font-weight: 700;
            color: var(--color-primary-10);
            background-color: var(--color-primary-opacity-6030);
            box-shadow: -1px 0 1px 0 var(--color-white-70) inset;
        }
    }

    &__lang {
        position: relative;
    }

    // Figma：180 × 44 固定、圓角 Corner-input、1px 邊框 Primary/60、底色 Primary/90、input_act 陰影
    &__lang-current {
        cursor: pointer;

        display: flex;
        gap: var(--corner-2);
        align-items: center;

        width: 180px;
        height: 44px;
        padding: var(--corner-2) var(--corner-3);

        // 平常框線透明、展開才轉成 Primary/60（她 2026-09-11 指定）。
        // 一開始就佔著 1px，展開時盒子才不會突然變大
        border: 1px solid transparent;
        border-radius: var(--corner-input);

        background: var(--bg-input);
        box-shadow: var(--shadow-input-active);

        &--open {
            border-color: var(--color-primary-60);
        }
    }

    &__lang-flag {
        flex-shrink: 0;
        width: 22px;
        height: 22px;
        border-radius: 50%;
    }

    // Figma：20px / 300 / Primary/10
    &__lang-name {
        overflow: hidden;
        flex: 1;

        font-size: 20px;
        font-weight: 300;

        // 140% 不是設計稿的 100%：英文的下伸部（g/y/p 的尾巴）與越南文聲調會超出 20px 行框，
        // 配上 overflow: hidden 就被裁掉。列高固定 44 且垂直置中，加大行高不影響版面
        line-height: 140%;
        color: var(--color-primary-10);
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // 用跟選單列同一支箭頭（arrow-right），靠旋轉決定方向：收起朝下、展開朝上
    &__lang-caret {
        transform: rotate(90deg);

        flex-shrink: 0;

        width: 22px;
        height: 22px;

        color: var(--color-primary-10);

        transition: transform 0.25s;

        // 用 270 不用 -90：從 90 轉到 270 是同方向再轉半圈，動畫才不會「翻面」卡住
        &--open {
            transform: rotate(270deg);
        }
    }

    // Figma：寬 180、圓角 8、左右內距 Corner-2、底色 Primary/90、input_act 陰影
    &__lang-list {
        position: absolute;
        z-index: 1;
        top: calc(100% + 6px);
        right: 0;

        width: 180px;
        padding: 0 var(--corner-2);
        border-radius: 8px;

        background: var(--bg-input);
        box-shadow: var(--shadow-input-active);
    }

    &__lang-item {
        cursor: pointer;

        display: flex;
        gap: var(--corner-2);
        align-items: center;

        width: 100%;
        height: 44px;
        padding: 0 var(--corner-2); // 左右留白：國旗與文字不貼著邊
        border: 0;
        border-bottom: 1px solid var(--color-white-30);

        background: none;

        transition: background-color 0.2s;

        @media (hover: hover) {
            &:hover {
                background-color: var(--bg-list-hover);
            }
        }
    }

    // Figma：清單文字 20px / 300 / Primary/20（比按鈕上的淡一階）
    &__lang-item &__lang-name {
        color: var(--color-primary-20);
    }

    // 選中的那一列：藍底 30%（跟「深」膠囊、NEW/HOT 選中同一色），文字轉白
    &__lang-item--active {
        background-color: var(--color-primary-opacity-6030);
    }

    &__lang-item--active &__lang-name {
        color: var(--color-primary-10);
    }

    li:last-child &__lang-item {
        border-bottom: 0;
    }

    // H5（她 2026-09-10 提供 14 張 Figma 截圖）：整體縮一號，背景/圓角/內距與 PC 相同
    @media (width < 960px) {
        width: 300px;

        // Figma 面板高 333 = 上下內距 20 + 帳號區 57 + 四列 x 64
        // 帳號區 57 = 頭像 56 + 分隔線 1，所以 H5 沒有下方留白
        &__account {
            padding-bottom: 0;
        }

        &__avatar {
            width: 56px;
            height: 56px;
        }

        &__avatar-label {
            font-size: 12px;
        }

        &__profile-label,
        &__profile-value {
            font-size: 16px;
        }

        &__row-label {
            font-size: 16px;
        }

        &__row-arrow {
            width: 19px;
            height: 19px;
        }

        // 46 x 27 是靠 padding 撐出來的：文字 16 x 19 + 左右 15 + 上下 4
        &__theme-btn {
            height: 27px;
            font-size: 16px;
        }

        &__lang-name {
            font-size: 16px;
        }

        &__lang-flag,
        &__lang-caret {
            width: 19px;
            height: 19px;
        }
    }

    // 300 在極窄螢幕還是會頂到邊，改成貼齊畫面左右各留 16
    @media (width < 332px) {
        width: calc(100vw - 32px);
    }
}
</style>
