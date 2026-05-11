import { useQuery } from '@tanstack/react-query';
import { getMeSecurity } from '../../../entities/me/security-api';

export function useMeSecurityQuery() {
    return useQuery({
        queryKey: ['me', 'security'],
        queryFn: getMeSecurity,
    });
}