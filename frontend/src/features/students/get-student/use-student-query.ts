import { useQuery } from '@tanstack/react-query';
import { getStudent } from '../../../entities/student/api';

export function useStudentQuery(id: string | null | undefined) {
    return useQuery({
        queryKey: ['students', 'details', id],
        queryFn: () => getStudent(id!),
        enabled: Boolean(id),
    });
}