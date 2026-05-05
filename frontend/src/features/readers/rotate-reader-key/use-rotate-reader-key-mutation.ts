import { useMutation } from '@tanstack/react-query';
import { rotateReaderApiKey } from '../../../entities/reader/api';

export function useRotateReaderKeyMutation() {
    return useMutation({
        mutationFn: rotateReaderApiKey,
    });
}