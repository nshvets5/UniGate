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