import { useQuery } from '@tanstack/react-query';
import {
    getAuditEvents,
    type GetAuditEventsParams,
} from '../../../entities/audit/api';

export function useAuditEventsQuery(params: GetAuditEventsParams) {
    return useQuery({
        queryKey: ['audit-events', params],
        queryFn: () => getAuditEvents(params),
    });
}