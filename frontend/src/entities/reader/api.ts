import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';

export type ReaderType = 1 | 2 | 3 | 4;

export type ReaderDto = {
    id: string;
    code: string;
    name: string;
    doorId: string;
    type: ReaderType;
    isActive: boolean;
    hasApiKey?: boolean;
    createdAt?: string;
    lastSeenAt?: string | null;
};

export type GetReadersParams = {
    page?: number;
    pageSize?: number;
};

export async function getReaders(params: GetReadersParams) {
    const response = await api.get<PagedResult<ReaderDto>>('/readers', {
        params,
    });

    return response.data;
}

export async function setReaderActive(id: string, isActive: boolean) {
    const response = await api.patch<ReaderDto>(`/readers/${id}/active`, {
        isActive,
    });

    return response.data;
}

export async function rotateReaderApiKey(id: string) {
    const response = await api.post<{
        id: string;
        code: string;
        apiKey: string;
    }>(`/readers/${id}/rotate-api-key`);

    return response.data;
}