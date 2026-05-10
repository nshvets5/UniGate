import { useMutation } from '@tanstack/react-query';
import { previewTimetableIcs } from '../../../entities/timetable/api';

export function usePreviewTimetableIcsMutation() {
    return useMutation({
        mutationFn: previewTimetableIcs,
    });
}