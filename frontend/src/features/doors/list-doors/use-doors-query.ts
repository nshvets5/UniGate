import { useQuery } from '@tanstack/react-query';
import { getDoors } from '../../../entities/door/api';
import type { GetDoorsParams } from '../../../entities/door/types';
import { queryKeys } from '../../../shared/api/query-keys';

export function useDoorsQuery(params: GetDoorsParams) {
    return useQuery({
        queryKey: queryKeys.doors.list(params),
        queryFn: () => getDoors(params),
    });
}