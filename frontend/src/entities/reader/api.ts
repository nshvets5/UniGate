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

export type ReaderStatusDto = {
    id: string;
    code: string;
    name: string;
    doorId: string;
    type: ReaderType;
    isActive: boolean;
    hasApiKey: boolean;
    createdAt: string;
    lastSeenAt: string | null;
    utcNow: string;
    isOnline: boolean;
};

export type GetReadersParams = {
    page?: number;
    pageSize?: number;
};

export type CreateReaderRequest = {
    code: string;
    name: string;
    doorId: string;
    type: ReaderType;
};

export type UpdateReaderRequest = {
    id: string;
    code: string;
    name: string;
    doorId: string;
    type: ReaderType;
};

export type ReaderAttemptDto = {
    id: string;
    readerId: string;
    credentialType: string;
    credentialValue: string;
    credentialId: string | null;
    studentId: string | null;
    isAllowed: boolean;
    reasonCode: string;
    occurredAt: string;
};

export type GetReaderAttemptsParams = {
    isAllowed?: boolean;
    credentialType?: string;
    credentialValue?: string;
    fromUtc?: string;
    toUtc?: string;
    page?: number;
    pageSize?: number;
};

export async function getReaders(params: GetReadersParams) {
    const response = await api.get<PagedResult<ReaderDto>>('/readers', {
        params,
    });

    return response.data;
}

export async function getReaderStatus(id: string) {
    const response = await api.get<ReaderStatusDto>(`/readers/${id}/status`);
    return response.data;
}

export async function createReader(payload: CreateReaderRequest) {
    const response = await api.post<{
        id: string;
        code: string;
        apiKey: string;
    }>('/readers', payload);

    return response.data;
}

export async function updateReader(payload: UpdateReaderRequest) {
    const response = await api.put<ReaderDto>(`/readers/${payload.id}`, payload);
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

export async function getReader(id: string) {
    const response = await api.get<ReaderDto>(`/readers/${id}`);
    return response.data;
}

export async function getReaderAttempts(
    readerId: string,
    params: GetReaderAttemptsParams
) {
    const response = await api.get<PagedResult<ReaderAttemptDto>>(
        `/readers/${readerId}/attempts`,
        { params }
    );

    return response.data;
}