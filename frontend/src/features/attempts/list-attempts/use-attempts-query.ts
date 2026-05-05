import { useQuery } from '@tanstack/react-query';
import { getAttempts } from '../../../entities/attempt/api';

export function useAttemptsQuery(params: any) {
    return useQuery({
        queryKey: ['attempts', params],
        queryFn: () => getAttempts(params),
    });
}