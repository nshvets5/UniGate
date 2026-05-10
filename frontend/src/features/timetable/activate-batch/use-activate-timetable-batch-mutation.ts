import { useMutation, useQueryClient } from '@tanstack/react-query';
import { activateTimetableBatch } from '../../../entities/timetable/api';

export function useActivateTimetableBatchMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: activateTimetableBatch,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['timetable-batches'],
            });
        },
    });
}