import { useQuery } from '@tanstack/react-query';
import { getReader } from '../../../entities/reader/api';

export function useReaderQuery(id: string) {
    return useQuery({
        queryKey: ['readers', 'detail', id],
        queryFn: () => getReader(id),
        enabled: Boolean(id),
    });
}