import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStudentCredential } from '../../../entities/student/api';
import { queryKeys } from '../../../shared/api/query-keys';
import type { CreateStudentCredentialRequest } from '../../../entities/student/types';

export function useCreateStudentCredentialMutation(studentId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateStudentCredentialRequest) =>
            createStudentCredential(studentId, payload),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.students.credentials(studentId),
            });
        },
    });
}