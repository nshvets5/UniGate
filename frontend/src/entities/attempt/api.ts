import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';

export type AttemptDto = {
    id: string;
    readerId: string;
    credentialType: string;
    credentialValue: string;
    studentId?: string;
    isAllowed: boolean;
    reasonCode: string;
    occurredAt: string;
};

export type GetAttemptsParams = {
    isAllowed?: boolean;
    credentialType?: string;
    fromUtc?: string;
    toUtc?: string;
    page?: number;
    pageSize?: number;
};

export async function getAttempts(params: GetAttemptsParams) {
    const response = await api.get<PagedResult<AttemptDto>>('/device/attempts', {
        params,
    });

    return response.data;
}