import { api } from '../../shared/api/axios';
import type { PagedResult } from '../../shared/types/pagination';

export type AuditEventDto = {
    id: string;
    occurredAt: string;
    type: string;
    actorProvider: string | null;
    actorSubject: string | null;
    actorProfileId: string | null;
    resourceType: string | null;
    resourceId: string | null;
    correlationId: string | null;
    traceId: string | null;
    ip: string | null;
    userAgent: string | null;
    dataJson: string | null;
    sourceMessageId: string | null;
};

export type GetAuditEventsParams = {
    type?: string;
    resourceType?: string;
    actorId?: string;
    fromUtc?: string;
    toUtc?: string;
    page?: number;
    pageSize?: number;
};

export async function getAuditEvents(params: GetAuditEventsParams) {
    const response = await api.get<PagedResult<AuditEventDto>>('/audit/events', {
        params,
    });

    return response.data;
}