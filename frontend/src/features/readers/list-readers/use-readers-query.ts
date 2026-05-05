import { useQuery } from '@tanstack/react-query';
import { getReaders } from '../../../entities/reader/api';

export function useReadersQuery(params: any) {
    return useQuery({
        queryKey: ['readers', params],
        queryFn: () => getReaders(params),
    });
}