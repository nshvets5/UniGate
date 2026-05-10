import { useMutation, useQueryClient } from '@tanstack/react-query';
import { applyTimetablePreview } from '../../../entities/timetable/api';

export function useApplyTimetablePreviewMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: applyTimetablePreview,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['timetable-batches'],
            });
        },
    });
}