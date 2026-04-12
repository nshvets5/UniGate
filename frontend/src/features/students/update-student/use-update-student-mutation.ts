import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateStudent } from '../../../entities/student/api';
import { queryKeys } from '../../../shared/api/query-keys';
import type { UpdateStudentRequest } from '../../../entities/student/types';

export function useUpdateStudentMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateStudent,
        onSuccess: async (_data, variables: UpdateStudentRequest) => {
            await Promise.all([
                queryClient.invalidateQueries({
                    queryKey: queryKeys.students.all,
                }),
                queryClient.invalidateQueries({
                    queryKey: queryKeys.students.detail(variables.id),
                }),
            ]);
        },
    });
}