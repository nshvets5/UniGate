import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setDoorActive } from '../../../entities/door/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useToggleDoorActiveMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         isActive,
                     }: {
            id: string;
            isActive: boolean;
        }) => setDoorActive(id, { isActive }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.doors.all,
            });
        },
    });
}