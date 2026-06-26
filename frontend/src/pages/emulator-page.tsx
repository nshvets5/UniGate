import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import PlayArrowOutlinedIcon from '@mui/icons-material/PlayArrowOutlined';
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import VpnKeyOutlinedIcon from '@mui/icons-material/VpnKeyOutlined';
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
import type { DoorDto } from '../entities/door/types';
import type { RoomDto } from '../entities/room/api';
import type { ZoneDto } from '../entities/zone/types';
import { useDoorsQuery } from '../features/doors/list-doors/use-doors-query';
import { useRoomsQuery } from '../features/rooms/list-rooms/use-rooms-query';
import { useZonesQuery } from '../features/zones/list-zones/use-zones-query';

export function EmulatorPage() {
    const theme = useTheme();

    const [readerId, setReaderId] = useState('');
    const [deviceKey, setDeviceKey] = useState('');
    const [credentialType, setCredentialType] = useState<DeviceCredentialType>('rfid');
    const [credentialValue, setCredentialValue] = useState('');
    const [lastResult, setLastResult] = useState<ScanResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const readersQuery = useReadersQuery({ page: 1, pageSize: 100 });

    const doorsQuery = useDoorsQuery({
        page: 1,
        pageSize: 100,
    });

    const roomsQuery = useRoomsQuery({
        page: 1,
        pageSize: 100,
    });

    const zonesQuery = useZonesQuery({
        page: 1,
        pageSize: 100,
    });

    const scanMutation = useScanCredentialMutation();

    const readers = readersQuery.data?.items ?? [];

    const doors = doorsQuery.data?.items ?? [];
    const rooms = roomsQuery.data?.items ?? [];
    const zones = zonesQuery.data?.items ?? [];

    const doorMap = useMemo(() => {
        const map = new Map<string, DoorDto>();

        for (const door of doors) {
            map.set(door.id, door);
        }

        return map;
    }, [doors]);

    const roomMap = useMemo(() => {
        const map = new Map<string, RoomDto>();

        for (const room of rooms) {
            map.set(room.id, room);
        }

        return map;
    }, [rooms]);

    const zoneMap = useMemo(() => {
        const map = new Map<string, ZoneDto>();

        for (const zone of zones) {
            map.set(zone.id, zone);
        }

        return map;
    }, [zones]);

    const selectedReader = useMemo(
        () => readers.find((reader) => reader.id === readerId) ?? null,
        [readers, readerId]
    );

    const selectedDoor = selectedReader?.doorId
        ? doorMap.get(selectedReader.doorId) ?? null
        : null;

    const selectedRoom = selectedDoor?.roomId
        ? roomMap.get(selectedDoor.roomId) ?? null
        : null;

    const selectedZone = selectedDoor?.zoneId
        ? zoneMap.get(selectedDoor.zoneId) ?? null
        : null;

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
            setError('Scan request failed. Check selected reader, device key and credential value.');
        }
    };

    return (
        <PageContainer>
            <PageHeader
                title="Reader emulator"
                subtitle="Virtual device console for testing real access decisions without physical RFID or QR hardware."
                actions={
                    <Button
                        variant="outlined"
                        startIcon={<RefreshOutlinedIcon />}
                        onClick={() => {
                            void readersQuery.refetch();
                            void doorsQuery.refetch();
                            void roomsQuery.refetch();
                            void zonesQuery.refetch();
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
                        xl: '430px minmax(0, 1fr)',
                    },
                    gap: 3,
                    alignItems: 'start',
                }}
            >
                <Stack spacing={3}>
                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <EmulatorHeader
                            icon={<MemoryOutlinedIcon />}
                            title="Reader identity"
                            subtitle="Choose a registered reader and authenticate as a device."
                        />

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
                                        setError(null);
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
                                helperText="Use the API key shown after reader creation or key rotation."
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <VpnKeyOutlinedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <ReaderIdentityCard
                                reader={selectedReader}
                                door={selectedDoor}
                                room={selectedRoom}
                                zone={selectedZone}
                            />
                        </Stack>
                    </SectionCard>

                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <EmulatorHeader
                            icon={<TerminalOutlinedIcon />}
                            title="Scan terminal"
                            subtitle="Submit credential data exactly like a physical reader."
                        />

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
                                placeholder="RFID-000001 / QR-000240 / MANUAL-000001"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <KeyOutlinedIcon />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <Box
                                sx={{
                                    p: 1.5,
                                    borderRadius: 3,
                                    border: '1px dashed',
                                    borderColor: alpha(theme.palette.primary.main, 0.28),
                                    bgcolor: alpha(theme.palette.primary.main, 0.035),
                                }}
                            >
                                <Typography variant="caption" color="text.secondary">
                                    Quick test credentials
                                </Typography>

                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 1 }}>
                                    {[
                                        { type: 'rfid' as DeviceCredentialType, value: 'RFID-000001' },
                                        { type: 'qr' as DeviceCredentialType, value: 'QR-000240' },
                                        { type: 'manual' as DeviceCredentialType, value: 'MANUAL-000001' },
                                    ].map((item) => (
                                        <Button
                                            key={item.value}
                                            size="small"
                                            variant="outlined"
                                            onClick={() => {
                                                setCredentialType(item.type);
                                                setCredentialValue(item.value);
                                            }}
                                        >
                                            {item.value}
                                        </Button>
                                    ))}
                                </Stack>
                            </Box>

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
                                sx={{ py: 1.35 }}
                            >
                                Run device scan
                            </Button>
                        </Stack>
                    </SectionCard>
                </Stack>

                <Stack spacing={3}>
                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <EmulatorHeader
                            icon={lastResult?.allowed ? <CheckCircleOutlineOutlinedIcon /> : <BlockOutlinedIcon />}
                            title="Decision result"
                            subtitle="Response from the real backend access decision pipeline."
                            tone={lastResult ? (lastResult.allowed ? 'success' : 'error') : 'primary'}
                        />

                        <Divider />

                        {!lastResult ? (
                            <EmptyState
                                title="No scan result yet"
                                description="Select reader, enter device key and run a scan to see the decision."
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
                                spacing={1.5}
                            >
                                <Stack spacing={0.5}>
                                    <Typography variant="subtitle1">Recent reader attempts</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Latest scan attempts registered for the selected reader.
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
                                            <Stack minWidth={0}>
                                                <Typography
                                                    variant="body2"
                                                    fontWeight={900}
                                                    noWrap
                                                    sx={{
                                                        fontFamily:
                                                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                                                    }}
                                                >
                                                    {attempt.credentialValue}
                                                </Typography>

                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {attempt.credentialType.toUpperCase()} ·{' '}
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

function EmulatorHeader({
                            icon,
                            title,
                            subtitle,
                            tone = 'primary',
                        }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    tone?: 'primary' | 'success' | 'error';
}) {
    const theme = useTheme();

    const color =
        tone === 'success'
            ? theme.palette.success.main
            : tone === 'error'
                ? theme.palette.error.main
                : theme.palette.primary.main;

    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                    sx={{
                        width: 46,
                        height: 46,
                        borderRadius: 3,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: alpha(color, 0.12),
                        color,
                    }}
                >
                    {icon}
                </Box>

                <Stack spacing={0.35}>
                    <Typography variant="subtitle1">{title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {subtitle}
                    </Typography>
                </Stack>
            </Stack>
        </Box>
    );
}

function ReaderIdentityCard({
                                reader,
                                door,
                                room,
                                zone,
                            }: {
    reader: any | null;
    door: DoorDto | null;
    room: RoomDto | null;
    zone: ZoneDto | null;
}) {
    const theme = useTheme();

    if (!reader) {
        return (
            <Box
                sx={{
                    p: 2,
                    borderRadius: 3,
                    border: '1px dashed',
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.text.secondary, 0.025),
                }}
            >
                <Typography variant="body2" color="text.secondary">
                    Reader context will appear here after selection.
                </Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 3,
                border: '1px solid',
                borderColor: reader.isActive
                    ? alpha(theme.palette.success.main, 0.28)
                    : alpha(theme.palette.warning.main, 0.28),
                bgcolor: alpha(theme.palette.primary.main, 0.035),
            }}
        >
            <Stack spacing={1.75}>
                <Stack spacing={0.4}>
                    <Typography variant="subtitle2">{reader.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {reader.code}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <StatusChip
                        label={reader.isActive ? 'Active' : 'Inactive'}
                        variant={reader.isActive ? 'success' : 'warning'}
                    />
                    <StatusChip
                        label={door ? 'Door linked' : 'Door missing'}
                        variant={door ? 'info' : 'warning'}
                    />
                </Stack>

                <Box
                    sx={{
                        display: 'grid',
                        gap: 1,
                    }}
                >
                    <ContextRow
                        label="Door"
                        value={door ? `${door.name} (${door.code})` : reader.doorId}
                    />

                    <ContextRow
                        label="Room"
                        value={
                            room
                                ? `${room.name} (${room.code})`
                                : door?.roomId
                                    ? door.roomId
                                    : 'Zone-level entrance'
                        }
                    />

                    <ContextRow
                        label="Zone"
                        value={zone ? `${zone.name} (${zone.code})` : door?.zoneId ?? '—'}
                    />
                </Box>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ wordBreak: 'break-all' }}
                >
                    Reader ID: {reader.id}
                </Typography>
            </Stack>
        </Box>
    );
}

function ContextRow({
                        label,
                        value,
                    }: {
    label: string;
    value: string;
}) {
    return (
        <Box
            sx={{
                p: 1.25,
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>

            <Typography variant="body2" fontWeight={700} sx={{ wordBreak: 'break-word' }}>
                {value}
            </Typography>
        </Box>
    );
}

function DecisionPanel({ result }: { result: ScanResponse }) {
    const theme = useTheme();

    const color = result.allowed ? theme.palette.success.main : theme.palette.error.main;

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
                            width: 58,
                            height: 58,
                            borderRadius: 4,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(color, 0.14),
                            color,
                        }}
                    >
                        {result.allowed ? (
                            <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 32 }} />
                        ) : (
                            <BlockOutlinedIcon sx={{ fontSize: 32 }} />
                        )}
                    </Box>

                    <Stack>
                        <Typography variant="overline" color="text.secondary">
                            Access decision
                        </Typography>

                        <Typography variant="h4" fontWeight={900} sx={{ color }}>
                            {result.allowed ? 'ALLOWED' : 'DENIED'}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {result.reasonCode}
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

function shortId(value?: string | null) {
    if (!value) return '—';
    return value.slice(0, 8);
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