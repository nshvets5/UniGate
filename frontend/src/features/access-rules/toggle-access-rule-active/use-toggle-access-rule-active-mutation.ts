import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setAccessRuleActive } from '../../../entities/access-rule/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useToggleAccessRuleActiveMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         isActive,
                     }: {
            id: string;
            isActive: boolean;
        }) => setAccessRuleActive(id, { isActive }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.accessRules.all,
            });
        },
    });
}