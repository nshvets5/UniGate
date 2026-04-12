import { useQuery } from '@tanstack/react-query';
import { getZones } from '../../../entities/zone/api';
import type { GetZonesParams } from '../../../entities/zone/types';
import { queryKeys } from '../../../shared/api/query-keys';

export function useZonesQuery(params: GetZonesParams) {
    return useQuery({
        queryKey: queryKeys.zones.list(params),
        queryFn: () => getZones(params),
    });
}