import { api } from '../../shared/api/axios';

export type CredentialType = 'rfid' | 'qr' | 'manual';

export type ReaderScanRequest = {
    credentialType: CredentialType;
    credentialValue: string;
};

export type ReaderScanResponse = {
    allowed: boolean;
    reasonCode: string;
    readerId: string;
    doorId: string;
    studentId: string | null;
    credentialId: string | null;
};

export async function scanReader(
    readerId: string,
    apiKey: string,
    payload: ReaderScanRequest
) {
    const response = await api.post<ReaderScanResponse>(
        `/device/readers/${readerId}/scan`,
        payload,
        {
            headers: {
                'X-Device-Key': apiKey,
            },
        }
    );

    return response.data;
}