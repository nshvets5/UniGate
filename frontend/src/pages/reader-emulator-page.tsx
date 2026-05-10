import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import type { CredentialType } from '../entities/device-scan/api';
import { useReadersQuery } from '../features/readers/list-readers/use-readers-query';
import { useScanReaderMutation } from '../features/device-emulator/scan-reader/use-scan-reader-mutation';
import { CodeBadge } from '../shared/ui/code-badge';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

const credentialTypes: { value: CredentialType; label: string }[] = [
    { value: 'rfid', label: 'RFID' },
    { value: 'qr', label: 'QR' },
    { value: 'manual', label: 'Manual' },
];

export function ReaderEmulatorPage() {
    const [readerId, setReaderId] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [credentialType, setCredentialType] = useState<CredentialType>('rfid');
    const [credentialValue, setCredentialValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const readersQuery = useReadersQuery({
        page: 1,
        pageSize: 100,
    });

    const scanMutation = useScanReaderMutation();

    const readers = readersQuery.data?.items ?? [];

    const selectedReader = useMemo(
        () => readers.find((reader) => reader.id === readerId) ?? null,
        [readers, readerId]
    );

    const handleSubmit = async () => {
        try {
            setError(null);

            await scanMutation.mutateAsync({
                readerId,
                apiKey: apiKey.trim(),
                credentialType,
                credentialValue: credentialValue.trim(),
            });
        } catch {
            setError('Scan failed. Please verify reader, API key and credential value.');
        }
    };

    const result = scanMutation.data;

    return (
        <PageContainer>
            <PageHeader
                title="Reader emulator"
                subtitle="Simulate RFID, QR or manual credential scans using a selected reader device."
            />

            {readersQuery.isLoading ? (
                <LoadingState
                    title="Loading readers"
                    description="Please wait while reader devices are being loaded."
                />
            ) : readersQuery.isError ? (
                <ErrorState
                    title="Failed to load readers"
                    description="Reader devices could not be loaded from the server."
                    onRetry={() => void readersQuery.refetch()}
                />
            ) : (
                <Box
                    sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1.1fr) minmax(360px, 0.9fr)' },
                        gap: 3,
                    }}
                >
                    <SectionCard>
                        <Stack spacing={2.5}>
                            <Stack spacing={0.75}>
                                <Typography variant="subtitle1">Scan input</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Enter reader API key and credential payload to test the full access decision pipeline.
                                </Typography>
                            </Stack>

                            <TextField
                                select
                                label="Reader"
                                value={readerId}
                                onChange={(event) => setReaderId(event.target.value)}
                                fullWidth
                            >
                                {readers.map((reader) => (
                                    <MenuItem key={reader.id} value={reader.id}>
                                        {reader.name} ({reader.code})
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Reader API key"
                                value={apiKey}
                                onChange={(event) => setApiKey(event.target.value)}
                                fullWidth
                                type="password"
                                helperText="The API key is shown only when creating or rotating a reader key."
                            />

                            <TextField
                                select
                                label="Credential type"
                                value={credentialType}
                                onChange={(event) =>
                                    setCredentialType(event.target.value as CredentialType)
                                }
                                fullWidth
                            >
                                {credentialTypes.map((item) => (
                                    <MenuItem key={item.value} value={item.value}>
                                        {item.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                label="Credential value"
                                value={credentialValue}
                                onChange={(event) => setCredentialValue(event.target.value)}
                                fullWidth
                                placeholder="04A3FF219B"
                            />

                            {error ? <Alert severity="error">{error}</Alert> : null}

                            <Button
                                variant="contained"
                                size="large"
                                startIcon={
                                    scanMutation.isPending ? (
                                        <CircularProgress size={18} />
                                    ) : (
                                        <PlayArrowOutlinedIcon />
                                    )
                                }
                                onClick={() => void handleSubmit()}
                                disabled={
                                    scanMutation.isPending ||
                                    !readerId ||
                                    !apiKey.trim() ||
                                    !credentialValue.trim()
                                }
                            >
                                Run scan
                            </Button>
                        </Stack>
                    </SectionCard>

                    <Stack spacing={3}>
                        <SectionCard>
                            <Stack spacing={2}>
                                <Typography variant="subtitle1">Selected reader</Typography>

                                {selectedReader ? (
                                    <>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <CodeBadge value={selectedReader.code} />
                                            <StatusChip
                                                label={selectedReader.isActive ? 'Active' : 'Inactive'}
                                                variant={selectedReader.isActive ? 'success' : 'warning'}
                                            />
                                        </Stack>

                                        <Stack spacing={0.5}>
                                            <Typography variant="h6">{selectedReader.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Door ID: {selectedReader.doorId}
                                            </Typography>
                                        </Stack>
                                    </>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">
                                        Select a reader to start emulation.
                                    </Typography>
                                )}
                            </Stack>
                        </SectionCard>

                        <SectionCard>
                            <Stack spacing={2}>
                                <Typography variant="subtitle1">Decision result</Typography>

                                {!result ? (
                                    <Typography variant="body2" color="text.secondary">
                                        No scan has been executed yet.
                                    </Typography>
                                ) : (
                                    <>
                                        <Alert severity={result.allowed ? 'success' : 'error'}>
                                            {result.allowed ? 'Access allowed' : 'Access denied'} —{' '}
                                            {result.reasonCode}
                                        </Alert>

                                        <Divider />

                                        <Stack spacing={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                Reader ID
                                            </Typography>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                {result.readerId}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Door ID
                                            </Typography>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                {result.doorId}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Student ID
                                            </Typography>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                {result.studentId ?? '—'}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Credential ID
                                            </Typography>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                {result.credentialId ?? '—'}
                                            </Typography>
                                        </Stack>
                                    </>
                                )}
                            </Stack>
                        </SectionCard>
                    </Stack>
                </Box>
            )}
        </PageContainer>
    );
}