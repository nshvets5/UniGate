import { useQuery } from '@tanstack/react-query';
import { getStudentCredentials } from '../../../entities/student/api';
import { queryKeys } from '../../../shared/api/query-keys';

export function useStudentCredentialsQuery(studentId: string) {
    return useQuery({
        queryKey: queryKeys.students.credentials(studentId),
        queryFn: () => getStudentCredentials(studentId),
        enabled: Boolean(studentId),
    });
}