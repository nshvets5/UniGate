import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAccessRule } from '../../../entities/access-rule/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useCreateAccessRuleMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createAccessRule,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.accessRules.all,
            });
        },
    });
}