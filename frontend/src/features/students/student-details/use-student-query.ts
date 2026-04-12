import { useQuery } from '@tanstack/react-query';
import { getStudent } from '../../../entities/student/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useStudentQuery(id: string) {
    return useQuery({
        queryKey: queryKeys.students.detail(id),
        queryFn: () => getStudent(id),
        enabled: Boolean(id),
    });
}