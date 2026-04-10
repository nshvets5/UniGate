import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStudent } from '../../../entities/student/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useCreateStudentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createStudent,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.students.all,
            });
        },
    });
}