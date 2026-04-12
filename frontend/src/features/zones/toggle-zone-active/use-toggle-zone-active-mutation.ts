import { useMutation, useQueryClient } from '@tanstack/react-query';
import { setZoneActive } from '../../../entities/zone/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useToggleZoneActiveMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
                         id,
                         isActive,
                     }: {
            id: string;
            isActive: boolean;
        }) => setZoneActive(id, { isActive }),
        onSuccess: async () => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.zones.all,
            });
        },
    });
}