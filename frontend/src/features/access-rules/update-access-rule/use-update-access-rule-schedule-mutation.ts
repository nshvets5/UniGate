import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    updateAccessRuleSchedule,
    type UpdateAccessRuleScheduleRequest,
} from '../../../entities/access-rule/api';

type Variables = {
    id: string;
    payload: UpdateAccessRuleScheduleRequest;
};

export function useUpdateAccessRuleScheduleMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, payload }: Variables) =>
            updateAccessRuleSchedule(id, payload),

        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: ['access-rules'],
            });
        },
    });
}