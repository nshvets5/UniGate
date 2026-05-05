import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import type { ReaderDto } from '../entities/reader/api';
import { useReadersQuery } from '../features/readers/list-readers/use-readers-query';
import { useRotateReaderKeyMutation } from '../features/readers/rotate-reader-key/use-rotate-reader-key-mutation';
import { useToggleReaderActiveMutation } from '../features/readers/toggle-reader-active/use-toggle-reader-active-mutation';
import { CodeBadge } from '../shared/ui/code-badge';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

const readerTypeLabels: Record<number, string> = {
    1: 'RFID',
    2: 'QR',
    3: 'Mixed',
    4: 'Emulator',
};

function isReaderOnline(reader: ReaderDto) {
    if (!reader.lastSeenAt) return false;

    const lastSeen = new Date(reader.lastSeenAt).getTime();
    const diffMinutes = (Date.now() - lastSeen) / 1000 / 60;

    return diffMinutes <= 2;
}

function formatLastSeen(value?: string | null) {
    if (!value) return 'Never seen';

    return new Date(value).toLocaleString();
}

export function ReadersPage() {
    const theme = useTheme();
    const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);

    const readersQuery = useReadersQuery({
        page: 1,
        pageSize: 50,
    });

    const toggleMutation = useToggleReaderActiveMutation();
    const rotateKeyMutation = useRotateReaderKeyMutation();

    const readers = readersQuery.data?.items ?? [];

    const stats = useMemo(() => {
        const online = readers.filter(isReaderOnline).length;
        const active = readers.filter((reader) => reader.isActive).length;

        return {
            total: readers.length,
            online,
            offline: readers.length - online,
            active,
        };
    }, [readers]);

    const handleToggleActive = async (reader: ReaderDto) => {
        await toggleMutation.mutateAsync({
            id: reader.id,
            isActive: !reader.isActive,
        });
    };

    const handleRotateKey = async (reader: ReaderDto) => {
        const result = await rotateKeyMutation.mutateAsync(reader.id);
        setRevealedApiKey(result.apiKey);
    };

    return (
        <PageContainer>
            <PageHeader
                title="Reader devices"
                subtitle="Monitor physical reader devices, lifecycle state and API key security."
            />

            {revealedApiKey ? (
                <Alert severity="warning" onClose={() => setRevealedApiKey(null)}>
                    New API key generated. Copy it now, it will not be shown again:
                    <Box component="code" sx={{ display: 'block', mt: 1, wordBreak: 'break-all' }}>
                        {revealedApiKey}
                    </Box>
                </Alert>
            ) : null}

            <Grid container spacing={2}>
                {[
                    ['Total readers', stats.total],
                    ['Online now', stats.online],
                    ['Offline', stats.offline],
                    ['Active', stats.active],
                ].map(([label, value]) => (
                    <Grid key={label} size={{ xs: 12, sm: 6, lg: 3 }}>
                        <SectionCard>
                            <Typography variant="body2" color="text.secondary">
                                {label}
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1 }}>
                                {value}
                            </Typography>
                        </SectionCard>
                    </Grid>
                ))}
            </Grid>

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
            ) : readers.length === 0 ? (
                <EmptyState
                    title="No readers found"
                    description="Create reader devices from the backend/admin API to start monitoring access points."
                />
            ) : (
                <Grid container spacing={2.5}>
                    {readers.map((reader) => {
                        const online = isReaderOnline(reader);
                        const isTogglingCurrent =
                            toggleMutation.isPending &&
                            toggleMutation.variables?.id === reader.id;
                        const isRotatingCurrent =
                            rotateKeyMutation.isPending &&
                            rotateKeyMutation.variables === reader.id;

                        return (
                            <Grid key={reader.id} size={{ xs: 12, md: 6, xl: 4 }}>
                                <SectionCard
                                    sx={{
                                        height: '100%',
                                        borderColor: online
                                            ? alpha(theme.palette.success.main, 0.28)
                                            : alpha(theme.palette.warning.main, 0.28),
                                    }}
                                >
                                    <Stack spacing={2.25}>
                                        <Stack direction="row" justifyContent="space-between" gap={2}>
                                            <Stack spacing={1} minWidth={0}>
                                                <Box
                                                    sx={{
                                                        width: 46,
                                                        height: 46,
                                                        borderRadius: 3,
                                                        display: 'grid',
                                                        placeItems: 'center',
                                                        bgcolor: online
                                                            ? alpha(theme.palette.success.main, 0.12)
                                                            : alpha(theme.palette.warning.main, 0.12),
                                                        color: online ? 'success.main' : 'warning.main',
                                                    }}
                                                >
                                                    {online ? <WifiOutlinedIcon /> : <WifiOffOutlinedIcon />}
                                                </Box>

                                                <Stack spacing={0.35}>
                                                    <Typography variant="h6" noWrap>
                                                        {reader.name}
                                                    </Typography>
                                                    <CodeBadge value={reader.code} />
                                                </Stack>
                                            </Stack>

                                            <Stack spacing={1} alignItems="flex-end">
                                                <StatusChip
                                                    label={online ? 'Online' : 'Offline'}
                                                    variant={online ? 'success' : 'warning'}
                                                />
                                                <StatusChip
                                                    label={reader.isActive ? 'Active' : 'Inactive'}
                                                    variant={reader.isActive ? 'success' : 'warning'}
                                                />
                                            </Stack>
                                        </Stack>

                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Chip
                                                size="small"
                                                icon={<SensorsOutlinedIcon />}
                                                label={readerTypeLabels[reader.type] ?? `Type ${reader.type}`}
                                                variant="outlined"
                                            />
                                            <Chip
                                                size="small"
                                                label={reader.hasApiKey ? 'API key configured' : 'No API key'}
                                                variant="outlined"
                                            />
                                        </Stack>

                                        <Stack spacing={0.75}>
                                            <Typography variant="body2" color="text.secondary">
                                                Door ID
                                            </Typography>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                                {reader.doorId}
                                            </Typography>
                                        </Stack>

                                        <Stack spacing={0.75}>
                                            <Typography variant="body2" color="text.secondary">
                                                Last heartbeat
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatLastSeen(reader.lastSeenAt)}
                                            </Typography>
                                        </Stack>

                                        <Box
                                            sx={{
                                                height: 1,
                                                bgcolor: 'divider',
                                            }}
                                        />

                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Button
                                                variant="outlined"
                                                color={reader.isActive ? 'warning' : 'success'}
                                                startIcon={
                                                    isTogglingCurrent ? (
                                                        <CircularProgress size={16} />
                                                    ) : reader.isActive ? (
                                                        <PauseCircleOutlineOutlinedIcon />
                                                    ) : (
                                                        <PlayCircleOutlineOutlinedIcon />
                                                    )
                                                }
                                                onClick={() => void handleToggleActive(reader)}
                                                disabled={isTogglingCurrent}
                                            >
                                                {reader.isActive ? 'Deactivate' : 'Activate'}
                                            </Button>

                                            <Button
                                                variant="outlined"
                                                startIcon={
                                                    isRotatingCurrent ? (
                                                        <CircularProgress size={16} />
                                                    ) : (
                                                        <KeyOutlinedIcon />
                                                    )
                                                }
                                                onClick={() => void handleRotateKey(reader)}
                                                disabled={isRotatingCurrent}
                                            >
                                                Rotate key
                                            </Button>
                                        </Stack>
                                    </Stack>
                                </SectionCard>
                            </Grid>
                        );
                    })}
                </Grid>
            )}
        </PageContainer>
    );
}