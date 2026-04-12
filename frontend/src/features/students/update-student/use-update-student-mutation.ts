import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStudent } from '../../../entities/student/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useUpdateStudentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStudent,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.students.all,
            });
        },
    });
}