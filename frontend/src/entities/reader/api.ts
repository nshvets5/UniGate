import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';

export type ReaderDto = {
    id: string;
    name: string;
    code: string;
    isActive: boolean;
    lastSeenAt?: string;
};

export async function getReaders(params: any) {
    const response = await api.get<PagedResult<ReaderDto>>('/readers', {
        params,
    });

    return response.data;
}