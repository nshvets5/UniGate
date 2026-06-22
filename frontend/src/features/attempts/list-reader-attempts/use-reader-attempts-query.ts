import { useQuery } from '@tanstack/react-query';
import {
    getReaderAttempts,
    type GetAttemptsParams,
} from '../../../entities/attempt/api';

export function useReaderAttemptsQuery(
    readerId: string | null | undefined,
    params: GetAttemptsParams
) {
    return useQuery({
        queryKey: ['reader-attempts', readerId, params],
        queryFn: () => getReaderAttempts(readerId!, params),
        enabled: Boolean(readerId),
    });
}