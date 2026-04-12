import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateZone } from '../../../entities/zone/api';
import { queryKeys } from '../../../shared/api/query-keys';
import type { UpdateZoneRequest } from '../../../entities/zone/types';

export function useUpdateZoneMutation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateZone,
        onSuccess: async (_data, variables: UpdateZoneRequest) => {
            await queryClient.invalidateQueries({
                queryKey: queryKeys.zones.all,
            });
        },
    });
}