import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDoor } from '../../../entities/door/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useCreateDoorMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createDoor,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.doors.all,
            });
        },
    });
}