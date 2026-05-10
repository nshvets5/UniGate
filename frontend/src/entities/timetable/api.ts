import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';

export type TimetableBatchDto = {
    id: string;
    source: string;
    fileName: string | null;
    status: string;
    totalRows: number;
    importedRows: number;
    skippedRows: number;
    isActive: boolean;
    createdAt: string;
    activatedAt: string | null;
};

export type GetTimetableBatchesParams = {
    page?: number;
    pageSize?: number;
};

export async function getTimetableBatches(params: GetTimetableBatchesParams) {
    const response = await api.get<PagedResult<TimetableBatchDto>>(
        '/timetable/batches',
        { params }
    );

    return response.data;
}

export async function activateTimetableBatch(batchId: string) {
    const response = await api.post<TimetableBatchDto>(
        `/timetable/batches/${batchId}/activate`
    );

    return response.data;
}