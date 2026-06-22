import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    InputAdornment,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import type { DeviceCredentialType, ScanResponse } from '../entities/device-emulator/api';
import { useReaderAttemptsQuery } from '../features/attempts/list-reader-attempts/use-reader-attempts-query';
import { useScanCredentialMutation } from '../features/device-emulator/scan/use-scan-credential-mutation';
import { useReadersQuery } from '../features/readers/list-readers/use-readers-query';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

export function EmulatorPage() {
    const theme = useTheme();

    const [readerId, setReaderId] = useState('');
    const [deviceKey, setDeviceKey] = useState('');
    const [credentialType, setCredentialType] = useState<DeviceCredentialType>('rfid');
    const [credentialValue, setCredentialValue] = useState('');
    const [lastResult, setLastResult] = useState<ScanResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const readersQuery = useReadersQuery({
        page: 1,
        pageSize: 100,
    });

    const scanMutation = useScanCredentialMutation();

    const readers = readersQuery.data?.items ?? [];

    const selectedReader = useMemo(
        () => readers.find((reader) => reader.id === readerId) ?? null,
        [readers, readerId]
    );

    const attemptsQuery = useReaderAttemptsQuery(readerId, {
        page: 1,
        pageSize: 8,
    });

    const attempts = attemptsQuery.data?.items ?? [];

    const handleScan = async () => {
        try {
            setError(null);
            setLastResult(null);

            if (!readerId) {
                setError('Please select a reader.');
                return;
            }

            if (!deviceKey.trim()) {
                setError('Please enter the reader device key.');
                return;
            }

            if (!credentialValue.trim()) {
                setError('Please enter a credential value.');
                return;
            }

            const result = await scanMutation.mutateAsync({
                readerId,
                deviceKey: deviceKey.trim(),
                credentialType,
                credentialValue: credentialValue.trim(),
            });

            setLastResult(result);
        } catch {
            setError('Scan request failed. Check reader, device key and credential data.');
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Reader emulator"
                subtitle="Virtual device console for testing the access decision pipeline without physical hardware."
                actions={
                    <Button
                        variant="outlined"
                        startIcon={<RefreshOutlinedIcon />}
                        onClick={() => {
                            void readersQuery.refetch();
                            void attemptsQuery.refetch();
                        }}
                    >
                        Refresh
                    </Button>
                }
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        xl: '420px minmax(0, 1fr)',
                    },
                    gap: 3,
                    alignItems: 'start',
                }}
            >
                <Stack spacing={3}>
                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 3,
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: 'primary.main',
                                    }}
                                >
                                    <MemoryOutlinedIcon />
                                </Box>

                                <Stack spacing={0.35}>
                                    <Typography variant="subtitle1">Reader identity</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Select a registered reader and provide its one-time API key.
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>

                        <Divider />

                        <Stack spacing={2.25} sx={{ p: 3 }}>
                            {readersQuery.isLoading ? (
                                <LoadingState title="Loading readers" />
                            ) : readersQuery.isError ? (
                                <ErrorState
                                    title="Failed to load readers"
                                    onRetry={() => void readersQuery.refetch()}
                                />
                            ) : (
                                <TextField
                                    select
                                    label="Reader"
                                    value={readerId}
                                    onChange={(event) => {
                                        setReaderId(event.target.value);
                                        setLastResult(null);
                                    }}
                                    fullWidth
                                >
                                    {readers.map((reader) => (
                                        <MenuItem key={reader.id} value={reader.id}>
                                            {reader.name} ({reader.code})
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}

                            <TextField
                                label="X-Device-Key"
                                value={deviceKey}
                                onChange={(event) => setDeviceKey(event.target.value)}
                                fullWidth
                                type="password"
                                helperText="This is the secret API key returned when the reader was created or rotated."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <KeyOutlinedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            {selectedReader ? (
                                <Box
                                    sx={{
                                        p: 2,
                                        borderRadius: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        bgcolor: alpha(theme.palette.primary.main, 0.035),
                                    }}
                                >
                                    <Stack spacing={1}>
                                        <Typography variant="subtitle2">
                                            {selectedReader.name}
                                        </Typography>

                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <StatusChip label={selectedReader.code} variant="info" />
                                            <StatusChip
                                                label={selectedReader.isActive ? 'Active' : 'Inactive'}
                                                variant={selectedReader.isActive ? 'success' : 'warning'}
                                            />
                                        </Stack>

                                        <Typography variant="caption" color="text.secondary">
                                            Door ID: {selectedReader.doorId}
                                        </Typography>
                                    </Stack>
                                </Box>
                            ) : null}
                        </Stack>
                    </SectionCard>

                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 3,
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: 'primary.main',
                                    }}
                                >
                                    <TerminalOutlinedIcon />
                                </Box>

                                <Stack spacing={0.35}>
                                    <Typography variant="subtitle1">Scan terminal</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Submit a credential exactly as a physical reader would.
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>

                        <Divider />

                        <Stack spacing={2.25} sx={{ p: 3 }}>
                            {error ? <Alert severity="error">{error}</Alert> : null}

                            <TextField
                                select
                                label="Credential type"
                                value={credentialType}
                                onChange={(event) =>
                                    setCredentialType(event.target.value as DeviceCredentialType)
                                }
                                fullWidth
                            >
                                <MenuItem value="rfid">RFID</MenuItem>
                                <MenuItem value="qr">QR</MenuItem>
                                <MenuItem value="manual">Manual</MenuItem>
                            </TextField>

                            <TextField
                                label="Credential value"
                                value={credentialValue}
                                onChange={(event) => setCredentialValue(event.target.value)}
                                fullWidth
                                placeholder="RFID-000001 / QR-000240"
                            />

                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                {['RFID-000001', 'QR-000240', 'MANUAL-000001'].map((value) => (
                                    <Button
                                        key={value}
                                        size="small"
                                        variant="outlined"
                                        onClick={() => {
                                            setCredentialValue(value);

                                            if (value.startsWith('RFID')) setCredentialType('rfid');
                                            if (value.startsWith('QR')) setCredentialType('qr');
                                            if (value.startsWith('MANUAL')) setCredentialType('manual');
                                        }}
                                    >
                                        {value}
                                    </Button>
                                ))}
                            </Stack>

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
                                onClick={() => void handleScan()}
                                disabled={scanMutation.isPending}
                            >
                                Run scan
                            </Button>
                        </Stack>
                    </SectionCard>
                </Stack>

                <Stack spacing={3}>
                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ p: 3 }}>
                            <Stack spacing={0.5}>
                                <Typography variant="subtitle1">Decision result</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Backend response from the real access decision pipeline.
                                </Typography>
                            </Stack>
                        </Box>

                        <Divider />

                        {!lastResult ? (
                            <EmptyState
                                title="No scan result yet"
                                description="Run a scan from the terminal to see allow/deny decision."
                            />
                        ) : (
                            <Box sx={{ p: 3 }}>
                                <DecisionPanel result={lastResult} />
                            </Box>
                        )}
                    </SectionCard>

                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ p: 3 }}>
                            <Stack
                                direction={{ xs: 'column', sm: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', sm: 'center' }}
                                spacing={1}
                            >
                                <Stack spacing={0.5}>
                                    <Typography variant="subtitle1">Recent reader attempts</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Latest attempts for the selected reader.
                                    </Typography>
                                </Stack>

                                {attemptsQuery.isFetching && readerId ? (
                                    <StatusChip label="Updating" variant="info" />
                                ) : null}
                            </Stack>
                        </Box>

                        <Divider />

                        {!readerId ? (
                            <EmptyState
                                title="Reader not selected"
                                description="Select a reader to load recent attempts."
                            />
                        ) : attemptsQuery.isLoading ? (
                            <LoadingState title="Loading reader attempts" />
                        ) : attemptsQuery.isError ? (
                            <ErrorState
                                title="Failed to load attempts"
                                onRetry={() => void attemptsQuery.refetch()}
                            />
                        ) : attempts.length === 0 ? (
                            <EmptyState
                                title="No attempts for this reader"
                                description="Run a scan to create the first attempt."
                            />
                        ) : (
                            <Stack divider={<Divider />}>
                                {attempts.map((attempt) => (
                                    <Box key={attempt.id} sx={{ p: 2.25 }}>
                                        <Stack
                                            direction={{ xs: 'column', md: 'row' }}
                                            spacing={1.5}
                                            justifyContent="space-between"
                                            alignItems={{ xs: 'flex-start', md: 'center' }}
                                        >
                                            <Stack spacing={0.35}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={800}
                                                    sx={{
                                                        fontFamily:
                                                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                                    }}
                                                >
                                                    {attempt.credentialValue}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(attempt.occurredAt).toLocaleString()}
                                                </Typography>
                                            </Stack>

                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                <StatusChip
                                                    label={attempt.isAllowed ? 'ALLOW' : 'DENY'}
                                                    variant={attempt.isAllowed ? 'success' : 'error'}
                                                />
                                                <StatusChip
                                                    label={attempt.reasonCode}
                                                    variant={attempt.isAllowed ? 'success' : 'warning'}
                                                />
                                            </Stack>
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </SectionCard>
                </Stack>
            </Box>
        </PageContainer>
    );
}

function DecisionPanel({ result }: { result: ScanResponse }) {
    const theme = useTheme();

    const color = result.allowed
        ? theme.palette.success.main
        : theme.palette.error.main;

    return (
        <Stack spacing={2.25}>
            <Box
                sx={{
                    p: 2.5,
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: alpha(color, 0.36),
                    bgcolor: alpha(color, 0.08),
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 54,
                            height: 54,
                            borderRadius: 3.5,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(color, 0.14),
                            color,
                        }}
                    >
                        {result.allowed ? (
                            <CheckCircleOutlineOutlinedIcon />
                        ) : (
                            <BlockOutlinedIcon />
                        )}
                    </Box>

                    <Stack>
                        <Typography variant="overline" color="text.secondary">
                            Access decision
                        </Typography>

                        <Typography variant="h4" fontWeight={900} sx={{ color }}>
                            {result.allowed ? 'ALLOWED' : 'DENIED'}
                        </Typography>
                    </Stack>
                </Stack>
            </Box>

            <Stack spacing={1.25}>
                <DecisionRow label="Reason code" value={result.reasonCode} />
                <DecisionRow label="Reader ID" value={result.readerId} />
                <DecisionRow label="Door ID" value={result.doorId ?? '—'} />
                <DecisionRow label="Student ID" value={result.studentId ?? '—'} />
                <DecisionRow label="Credential ID" value={result.credentialId ?? '—'} />
            </Stack>

            <Alert severity={result.allowed ? 'success' : 'warning'}>
                {explainReason(result.reasonCode)}
            </Alert>
        </Stack>
    );
}

function DecisionRow({ label, value }: { label: string; value: string }) {
    return (
        <Box
            sx={{
                px: 1.75,
                py: 1.25,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                display: 'grid',
                gridTemplateColumns: '140px minmax(0, 1fr)',
                gap: 2,
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>

            <Typography
                variant="body2"
                sx={{
                    wordBreak: 'break-all',
                    fontFamily:
                        'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

function explainReason(reasonCode: string) {
    const normalized = reasonCode.toUpperCase();

    switch (normalized) {
        case 'ALLOW':
        case 'ALLOWED':
            return 'Access was granted by the access policy engine.';

        case 'DENY':
        case 'DENIED':
            return 'Access was rejected because no active access rule allowed this attempt.';

        case 'CREDENTIAL_NOT_FOUND':
            return 'Credential was not found in the directory.';

        case 'CREDENTIAL_INACTIVE':
            return 'Credential exists, but it is inactive.';

        case 'STUDENT_INACTIVE':
            return 'Student profile is inactive.';

        case 'READER_INACTIVE':
            return 'Reader exists, but it is inactive.';

        default:
            return 'Backend returned a domain-specific reason code.';
    }
}