import { useQuery } from '@tanstack/react-query';
import { getReaderStatus } from '../../../entities/reader/api';

export function useReaderStatusQuery(id: string) {
    return useQuery({
        queryKey: ['readers', 'status', id],
        queryFn: () => getReaderStatus(id),
        enabled: Boolean(id),
        refetchInterval: 30_000,
    });
}