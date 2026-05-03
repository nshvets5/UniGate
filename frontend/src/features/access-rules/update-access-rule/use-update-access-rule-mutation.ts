import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAccessRuleSchedule } from '../../../entities/access-rule/api';
import { queryKeys } from '../../../shared/api/query-keys';
import type { UpdateAccessRuleScheduleRequest } from '../../../entities/access-rule/types';

export function useUpdateAccessRuleMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         payload,
                     }: {
            id: string;
            payload: UpdateAccessRuleScheduleRequest;
        }) => updateAccessRuleSchedule(id, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.accessRules.all,
            });
        },
    });
}