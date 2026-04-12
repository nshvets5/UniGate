import { useMutation, useQueryClient } from '@tanstack/react-query';
import { changeStudentGroup } from '../../../entities/student/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useChangeStudentGroupMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         groupId,
                     }: {
            id: string;
            groupId: string;
        }) => changeStudentGroup(id, { groupId }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.students.all,
            });
        },
    });
}