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

export type TimetableImportIssueDto = {
    lineNumber: number | null;
    code: string;
    message: string;
};

export type TimetableImportReportDto = {
    totalRows: number;
    importedRows: number;
    skippedRows: number;
    issues: TimetableImportIssueDto[];
};

export type TimetablePreviewResponseDto = {
    previewToken: string;
    report: TimetableImportReportDto;
    diff: unknown | null;
};

export type ApplyTimetablePreviewRequest = {
    previewToken: string;
};

export async function previewTimetableCsv(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<TimetablePreviewResponseDto>(
        '/timetable/import/csv/preview',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
}

export async function applyTimetablePreview(payload: ApplyTimetablePreviewRequest) {
    const response = await api.post<TimetableImportReportDto>(
        '/timetable/import/apply',
        payload
    );

    return response.data;
}

export async function previewTimetableIcs(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<TimetablePreviewResponseDto>(
        '/timetable/import/ics/preview',
        formData,
        {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        }
    );

    return response.data;
}

export type TimetableSyncStatusDto = {
    enabled: boolean;
    intervalSeconds: number;
    jitterSeconds: number;
    runOnStartup: boolean;
    lastRunUtc: string | null;
    lastSuccessUtc: string | null;
    lastUpdatedRulesCount: number;
    lastError: string | null;
    ageSeconds: number | null;
    staleAfterSeconds: number;
    isStale: boolean;
};

export async function getTimetableSyncStatus() {
    const response = await api.get<TimetableSyncStatusDto>(
        '/timetable/sync/status'
    );

    return response.data;
}

export async function syncTimetableNow() {
    const response = await api.post<void>('/timetable/sync-now');
    return response.data;
}