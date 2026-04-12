import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDoor } from '../../../entities/door/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useUpdateDoorMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateDoor,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.doors.all,
            });
        },
    });
}