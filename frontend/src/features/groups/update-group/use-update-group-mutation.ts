import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGroup } from '../../../entities/group/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useUpdateGroupMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateGroup,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.groups.all,
            });
        },
    });
}