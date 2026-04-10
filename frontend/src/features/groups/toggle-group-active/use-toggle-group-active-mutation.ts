import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setGroupActive } from '../../../entities/group/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useToggleGroupActiveMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         isActive,
                     }: {
            id: string;
            isActive: boolean;
        }) => setGroupActive(id, { isActive }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.groups.all,
            });
        },
    });
}