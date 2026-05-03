import { useQuery } from '@tanstack/react-query';
import { getAccessRules } from '../../../entities/access-rule/api';
import type { GetAccessRulesParams } from '../../../entities/access-rule/types';
import { queryKeys } from '../../../shared/api/query-keys';

export function useAccessRulesQuery(params: GetAccessRulesParams) {
    return useQuery({
        queryKey: queryKeys.accessRules.list(params),
        queryFn: () => getAccessRules(params),
    });
}