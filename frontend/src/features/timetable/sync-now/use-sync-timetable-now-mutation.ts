import { useMutation, useQueryClient } from '@tanstack/react-query';
import { syncTimetableNow } from '../../../entities/timetable/api';

export function useSyncTimetableNowMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: syncTimetableNow,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['timetable-sync-status'],
            });
        },
    });
}