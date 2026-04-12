import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setStudentCredentialActive } from '../../../entities/student/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useToggleStudentCredentialActiveMutation(studentId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         credentialId,
                         isActive,
                     }: {
            credentialId: string;
            isActive: boolean;
        }) => setStudentCredentialActive(studentId, credentialId, { isActive }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.students.credentials(studentId),
            });
        },
    });
}