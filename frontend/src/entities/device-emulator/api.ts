import { api } from '../../shared/api/axios';

export type DeviceCredentialType = 'rfid' | 'qr' | 'manual';

export type ScanRequest = {
    readerId: string;
    deviceKey: string;
    credentialType: DeviceCredentialType;
    credentialValue: string;
};

export type ScanResponse = {
    allowed: boolean;
    reasonCode: string;
    readerId: string;
    doorId?: string | null;
    studentId?: string | null;
    credentialId?: string | null;
};

export async function scanCredential(payload: ScanRequest) {
    const response = await api.post<ScanResponse>(
        `/device/readers/${payload.readerId}/scan`,
        {
            credentialType: payload.credentialType,
            credentialValue: payload.credentialValue,
        },
        {
            headers: {
                'X-Device-Key': payload.deviceKey,
            },
        }
    );

    return response.data;
}