import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '../../../entities/group/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useCreateGroupMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createGroup,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.groups.all,
            });
        },
    });
}