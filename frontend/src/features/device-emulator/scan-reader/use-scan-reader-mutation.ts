import { useMutation } from '@tanstack/react-query';
import {
    scanReader,
    type CredentialType,
} from '../../../entities/device-scan/api';

export function useScanReaderMutation() {
    return useMutation({
        mutationFn: ({
                         readerId,
                         apiKey,
                         credentialType,
                         credentialValue,
                     }: {
            readerId: string;
            apiKey: string;
            credentialType: CredentialType;
            credentialValue: string;
        }) =>
            scanReader(readerId, apiKey, {
                credentialType,
                credentialValue,
            }),
    });
}