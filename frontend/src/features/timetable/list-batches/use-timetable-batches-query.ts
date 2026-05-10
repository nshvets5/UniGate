import { useQuery } from '@tanstack/react-query';
import {
    getTimetableBatches,
    type GetTimetableBatchesParams,
} from '../../../entities/timetable/api';

export function useTimetableBatchesQuery(params: GetTimetableBatchesParams) {
    return useQuery({
        queryKey: ['timetable-batches', params],
        queryFn: () => getTimetableBatches(params),
    });
}