<template>
    <!-- 捲的是選單不是頁面：捲頁面會觸發「捲動就關閉選單」 -->
    <div
        ref="rootRef"
        class="header-menu"
        :class="{ 'header-menu--scroll': isMenuScroll }"
        :style="{ '--menu-max-h': menuMaxHeight, '--lang-list-max-h': langListMaxHeight }"
    >
        <div class="header-menu__account">
            <button
                :aria-label="$t('header.menu.changeAvatar')"
                class="header-menu__avatar"
                type="button"
                @click="openAvatarPicker"
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
                    ref="langListRef"
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

// 畫面高度不夠時的捲動：選單最多長到畫面底部往上 12px；語系清單同樣不超出畫面
const VIEWPORT_GAP = 12;
const rootRef = ref<HTMLElement | null>(null);
const langListRef = ref<HTMLElement | null>(null);
const isMenuScroll = ref(false);
const menuMaxHeight = ref<string>();
const langListMaxHeight = ref<string>();

// 主題與語系只是包套件，留在 composable；使用者與客服的狀態在 store，全站同一份
const { applyTheme, theme } = useTheme();
const { applyLocale, locale } = useLocale();
const userStore = useUserStore();
const {
    account,
    currentAvatar,
    nickname,
} = storeToRefs(userStore);
const { openAvatarPicker, openNicknameEditor } = userStore;
const { open: openSupport } = useSupportStore();
const { locales } = useI18n();

// Computed properties
// 語言清單直接用 i18n 註冊的那份，順序照 nuxt.config 的 LOCALES
const LANGUAGES = computed(() => locales.value.map((item) => ({
    code: item.code as LocaleCode,
    flag: FLAGS[item.code],
    label: item.name ?? item.code,
})));

// 語系清單打開後：選單在捲動模式就先把清單捲進來，再把清單高度限制在可見範圍內（超過就清單自己捲）
async function fitLangListToViewport() {
    await nextTick();

    const menu = rootRef.value;
    const list = langListRef.value;
    if (!menu || !list) return;

    // 選單在捲動模式：清單最多是選單可見高度扣上下留白，再把選單捲到清單底部看得到
    if (isMenuScroll.value) {
        const visible = menu.clientHeight - VIEWPORT_GAP * 2;
        langListMaxHeight.value = list.scrollHeight > visible ? `${visible}px` : undefined;
        await nextTick();

        const hidden = list.getBoundingClientRect().bottom - menu.getBoundingClientRect().bottom + VIEWPORT_GAP;
        if (hidden > 0) menu.scrollTop += hidden;

        return;
    }

    // 一般模式：清單往下長，最多到畫面底部往上 12px，太長就清單自己捲（至少留兩列高）
    const available = viewportHeight() - list.getBoundingClientRect().top - VIEWPORT_GAP;
    langListMaxHeight.value = list.scrollHeight > available ? `${Math.max(available, 90)}px` : undefined;
}

// 選單比「從選單頂端到畫面底」還高 → 開啟捲動模式並限制高度
// ⚠️ 只在需要時才開 overflow：一開 overflow，往下展開的語系清單就會被選單裁切
function fitMenuToViewport() {
    const menu = rootRef.value;
    if (!menu) return;

    const available = viewportHeight() - menu.getBoundingClientRect().top - VIEWPORT_GAP;
    isMenuScroll.value = menu.scrollHeight > available;
    menuMaxHeight.value = isMenuScroll.value ? `${available}px` : undefined;
}

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

// 可視高度（手機跳出網址列、鍵盤時，visualViewport 比 innerHeight 準）
function viewportHeight() {
    return window.visualViewport?.height ?? window.innerHeight;
}

// Watchers
watch(isLangOpen, (open) => {
    if (open) {
        fitLangListToViewport();

        return;
    }

    langListMaxHeight.value = undefined;
});

// Hooks
onMounted(() => {
    fitMenuToViewport();
    window.addEventListener('resize', fitMenuToViewport);
});

onUnmounted(() => {
    window.removeEventListener('resize', fitMenuToViewport);
});
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

    // Figma 面板寫 bg-blur 50；換成 CSS 要除以 2，所以是 25
    backdrop-filter: blur(25px);
    box-shadow: var(--shadow-bg);

    // 畫面太矮才開：選單自己捲，捲到底不連帶捲頁面（頁面一捲選單就會關）
    &--scroll {
        overflow-y: auto;
        overscroll-behavior: contain;
        max-height: var(--menu-max-h);
    }

    // 帳號區：頭像 66 + 帳號/暱稱 + 鉛筆
    &__account {
        display: flex;
        gap: var(--corner-2);
        align-items: center;

        // Figma 是 col + gap 10：分隔線上下各留 10（上面靠 padding-bottom，下面靠這條 margin）
        margin-bottom: var(--corner-2);

        // 左右內距跟下面的連結列一致，鉛筆才會跟那些箭頭對在同一條直線上
        padding: 0 var(--corner-2) var(--corner-2);
        border-bottom: 1px solid transparent;
        border-image: var(--line-2) 1;
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
        border-radius: var(--corner-full);

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

        height: 25px;

        font-size: var(--font-size-14);
        font-weight: var(--font-weight-regular);
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
        font-size: var(--font-size-18);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-20);
    }

    // Figma：18px / 500 / Primary/10
    &__profile-value {
        // 「…」要裁左右；上下不裁，聲調、泰文上下標才不會被切
        overflow: clip visible;

        // clip 不像 hidden 會讓它自動縮得比字窄，要自己寫 0，「…」才出得來（2026-09-17 她抓到）
        min-width: 0;

        font-size: var(--font-size-18);
        font-weight: var(--font-weight-medium);
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
                background-color: var(--color-primary-opacity-60-20);
            }

            // 語系那列不是連結，滑過不變色；寫在後面才壓得過上面那條
            &--lang:hover {
                background: none;
            }
        }
    }

    // Figma：18px / 500 / Primary/10
    &__row-label {
        font-size: var(--font-size-18);
        font-weight: var(--font-weight-medium);
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
        backdrop-filter: blur(25px); // Figma input：bg-blur 50 ÷ 2
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

        font-size: var(--font-size-18);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-40);

        background-color: transparent;

        transition:
            color 0.2s,
            background-color 0.2s,
            box-shadow 0.2s;

        &--active {
            font-weight: var(--font-weight-bold);
            color: var(--color-primary-10);
            background-color: var(--color-primary-opacity-60-30);
            box-shadow: -1px 0 1px 0 var(--color-white-70) inset;
        }
    }

    &__lang {
        position: relative;
    }

    // Figma：180 × 44 固定、圓角 Corner-input、1px 邊框 Primary/60、底色 Primary/90、input_act 陰影
    // PC 寬 192（她 2026-09-15 指定：越南文「Tiếng Việt」180 放不下）；H5 維持 180，見下方
    &__lang-current {
        cursor: pointer;

        display: flex;

        // Figma：旗子與文字只隔 4（箭頭靠文字的 flex: 1 推到最右）
        gap: var(--corner-1);
        align-items: center;

        width: 192px;
        height: var(--select-height);
        padding: var(--input-padding-y) var(--input-padding-x);

        // 平常框線透明、展開才轉成 Primary/60（她 2026-09-11 指定）。
        // 一開始就佔著 1px，展開時盒子才不會突然變大
        border: 1px solid transparent;
        border-radius: var(--corner-input);

        background: var(--bg-input);
        backdrop-filter: blur(25px); // Figma input：bg-blur 50 ÷ 2

        // 收合是 Figma 的 input（3-1 會員選單）、展開才是 input_act（3-2 語系下拉）
        // 平常補一圈全透明的外圈，湊成跟 input_act 一樣的 4 層，漸變才補得出來
        box-shadow:
            0 0 0 0 var(--color-white-0),
            var(--shadow-input);

        transition:
            border-color 0.25s ease,
            box-shadow 0.25s ease;

        &--open {
            border-color: var(--color-primary-60);
            box-shadow: var(--shadow-input-act);
        }
    }

    // Figma：按鈕上的旗子 24，清單裡的小一號 22（H5 分別是 19 與 17）
    &__lang-flag {
        flex-shrink: 0;
        width: 24px;
        height: 24px;
        border-radius: var(--corner-full);
    }

    // Figma：20px / 300 / Primary/10
    &__lang-name {
        // 「…」要裁左右；上下不裁，聲調、泰文上下標才不會被切
        overflow: clip visible;
        flex: 1;

        // clip 不像 hidden 會讓它自動縮得比字窄，要自己寫 0，「…」才出得來（2026-09-17 她抓到）
        min-width: 0;

        font-size: var(--font-size-20);
        font-weight: var(--font-weight-regular);
        color: var(--color-primary-10);
        text-align: left;
        text-overflow: ellipsis;
        white-space: nowrap;
    }

    // 用跟選單列同一支箭頭（arrow-right），靠旋轉決定方向：收起朝下、展開朝上
    &__lang-caret {
        transform: rotate(90deg);

        flex-shrink: 0;

        width: 24px;
        height: 24px;

        // Figma icon/arrow：Primary/20（比按鈕上的字淡一階）
        color: var(--color-primary-20);

        transition: transform 0.25s;

        // 用 270 不用 -90：從 90 轉到 270 是同方向再轉半圈，動畫才不會「翻面」卡住
        &--open {
            transform: rotate(270deg);
        }
    }

    // Figma：寬 180、圓角 8、左右內距 Corner-2、底色 Primary/90、input_act 陰影（PC 跟按鈕一起改 192）
    &__lang-list {
        position: absolute;
        z-index: 1;
        top: calc(100% + var(--select-list-offset));
        right: 0;

        overflow-y: auto;
        overscroll-behavior: contain;

        width: 192px;
        max-height: var(--lang-list-max-h, none);
        padding: 0 var(--corner-2);
        border-radius: 8px;

        background: var(--bg-input);
        backdrop-filter: blur(25px); // Figma input：bg-blur 50 ÷ 2
        box-shadow: var(--shadow-input-act);
    }

    &__lang-item {
        cursor: pointer;

        display: flex;

        // Figma：旗子與文字只隔 4
        gap: var(--corner-1);
        align-items: center;

        width: 100%;
        height: 45px;
        padding: 0 var(--corner-2); // 左右留白：國旗與文字不貼著邊
        border: 0;

        // Figma PC/list 的分隔線是 Primary/40 實色，不是半透明白；跟 Base/Select 的選項用同一支變數
        border-bottom: 1px solid var(--color-select-option-line);

        background: none;

        transition: background-color 0.2s;

        @media (hover: hover) {
            &:hover {
                background-color: var(--bg-list-hover);
            }
        }
    }

    &__lang-item &__lang-flag {
        width: 22px;
        height: 22px;
    }

    // Figma：清單文字 20px / 300 / Primary/20（比按鈕上的淡一階）
    &__lang-item &__lang-name {
        color: var(--color-primary-20);
    }

    // 選中的那一列：藍底 30%（跟「深」膠囊、NEW/HOT 選中同一色），文字轉白
    &__lang-item--active {
        background-color: var(--color-primary-opacity-60-30);
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

        &__avatar {
            width: 56px;
            height: 56px;
        }

        // Figma H5：黑帶 20（PC 25）
        &__avatar-label {
            height: 20px;
            font-size: var(--font-size-12);
        }

        &__profile-label,
        &__profile-value {
            font-size: var(--font-size-16);
        }

        &__row-label {
            font-size: var(--font-size-16);
        }

        &__row-arrow {
            width: 19px;
            height: 19px;
        }

        // Figma H5：選單列 59（PC 64）
        &__row {
            height: 59px;
        }

        // Figma H5：鉛筆 19（PC 22）
        &__edit {
            width: 19px;
            height: 19px;
        }

        // 46 x 27 是靠 padding 撐出來的：文字 16 x 19 + 左右 15 + 上下 4
        &__theme-btn {
            height: 27px;
            font-size: var(--font-size-16);
        }

        &__lang-name {
            font-size: var(--font-size-16);
        }

        // Figma H5：160。她 2026-09-15 曾為越南文「Tiếng Việt」放寬到 180（PC 192），
        // 2026-09-16 決定先照設計稿試 160，爆版再找設計師確認
        &__lang-current,
        &__lang-list {
            width: 160px;
        }

        // Figma MB/inpt：160 × 39 固定（PC 44）；清單跟著往上貼，仍離按鈕 5
        &__lang-current {
            height: 39px;
        }

        &__lang-flag,
        &__lang-caret {
            width: 19px;
            height: 19px;
        }

        // Figma H5：清單列 40（PC 45）、清單旗子 17（PC 22）
        &__lang-item {
            height: 40px;
        }

        &__lang-item &__lang-flag {
            width: 17px;
            height: 17px;
        }
    }

    // 300 在極窄螢幕還是會頂到邊，改成貼齊畫面左右各留 16
    @media (width < 332px) {
        width: calc(100vw - 32px);
    }
}
</style>
