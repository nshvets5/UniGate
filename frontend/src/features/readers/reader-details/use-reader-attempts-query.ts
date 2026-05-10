import { useQuery } from '@tanstack/react-query';
import {
    getReaderAttempts,
    type GetReaderAttemptsParams,
} from '../../../entities/reader/api';

export function useReaderAttemptsQuery(
    readerId: string,
    params: GetReaderAttemptsParams
) {
    return useQuery({
        queryKey: ['readers', 'attempts', readerId, params],
        queryFn: () => getReaderAttempts(readerId, params),
        enabled: Boolean(readerId),
        refetchInterval: 15_000,
    });
}