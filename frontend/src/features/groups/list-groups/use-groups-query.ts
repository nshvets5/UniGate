import { useQuery } from '@tanstack/react-query';
import { getGroups } from '../../../entities/group/api';
import type { GetGroupsParams } from '../../../entities/group/types';
import { queryKeys } from '../../../shared/api/query-keys';

export function useGroupsQuery(params: GetGroupsParams) {
    return useQuery({
        queryKey: queryKeys.groups.list(params),
        queryFn: () => getGroups(params),
    });
}