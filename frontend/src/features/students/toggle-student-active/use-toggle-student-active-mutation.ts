import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setStudentActive } from '../../../entities/student/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useToggleStudentActiveMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         isActive,
                     }: {
            id: string;
            isActive: boolean;
        }) => setStudentActive(id, { isActive }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.students.all,
            });
        },
    });
}