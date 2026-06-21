import { useQuery } from '@tanstack/react-query';
import {
    getAttempts,
    type GetAttemptsParams,
} from '../../../entities/attempt/api';

export function useAttemptsQuery(params: GetAttemptsParams) {
    return useQuery({
        queryKey: ['attempts', params],
        queryFn: () => getAttempts(params),
    });
}