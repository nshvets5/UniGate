import { useQuery } from '@tanstack/react-query';
import { getTimetableSyncStatus } from '../../../entities/timetable/api';

export function useTimetableSyncStatusQuery() {
    return useQuery({
        queryKey: ['timetable-sync-status'],
        queryFn: getTimetableSyncStatus,
        refetchInterval: 15_000,
    });
}