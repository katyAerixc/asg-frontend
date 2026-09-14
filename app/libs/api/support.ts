// 客服相關 API
// ⚠️ 路徑與欄位名是暫定的，等後端給規格再對

import type { SupportRecord } from '@/types/support';

import { createMockRecords } from './mock/support';

import {
    useApi,
    useMock,
} from './index';

export interface SupportTicketPayload {
    attachment: File | null;
    description: string;
    issueType: string;
}

export function fetchSupportRecords(): Promise<SupportRecord[]> {
    if (useMock()) return Promise.resolve(createMockRecords());

    return useApi()<SupportRecord[]>('/support/records');
}

// 點開一筆回覆就標已讀；假資料時什麼都不做（已讀狀態由畫面自己改）
export function markSupportReplyRead(id: number): Promise<void> {
    if (useMock()) return Promise.resolve();

    return useApi()<void>(`/support/records/${id}/read`, { method: 'POST' });
}

// 有附件所以用 FormData 送，不能用 JSON
export function submitSupportTicket(payload: SupportTicketPayload): Promise<void> {
    if (useMock()) return Promise.resolve();

    const body = new FormData();

    body.append('issueType', payload.issueType);
    body.append('description', payload.description);
    if (payload.attachment) body.append('attachment', payload.attachment);

    return useApi()<void>('/support/tickets', {
        body,
        method: 'POST',
    });
}
