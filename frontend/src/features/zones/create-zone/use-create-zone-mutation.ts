import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createZone } from '../../../entities/zone/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useCreateZoneMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createZone,
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.zones.all,
            });
        },
    });
}