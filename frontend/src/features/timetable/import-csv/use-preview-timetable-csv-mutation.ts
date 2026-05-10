import { useMutation } from '@tanstack/react-query';
import { previewTimetableCsv } from '../../../entities/timetable/api';

export function usePreviewTimetableCsvMutation() {
    return useMutation({
        mutationFn: previewTimetableCsv,
    });
}