import { useQuery } from '@tanstack/react-query';
import { getStudents } from '../../../entities/student/api';
import type { GetStudentsParams } from '../../../entities/student/types';
import { queryKeys } from '../../../shared/api/query-keys';

export function useStudentsQuery(params: GetStudentsParams) {
    return useQuery({
        queryKey: queryKeys.students.list(params),
        queryFn: () => getStudents(params),
    });
}