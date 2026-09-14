// 遊戲相關 API
// ⚠️ 路徑（/games）是暫定的，等後端給規格再對

import type { Game } from '@/types/game';

import { MOCK_GAMES } from './mock/games';

import {
    useApi,
    useMock,
} from './index';

export function fetchGames(): Promise<Game[]> {
    if (useMock()) return Promise.resolve(MOCK_GAMES);

    return useApi()<Game[]>('/games');
}
