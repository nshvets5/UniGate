import { useQuery } from '@tanstack/react-query';
import { getRooms, type GetRoomsParams } from '../../../entities/room/api';

export function useRoomsQuery(params: GetRoomsParams) {
    return useQuery({
        queryKey: ['rooms', params],
        queryFn: () => getRooms(params),
    });
}