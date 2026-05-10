import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
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
import type { DoorDto } from '../entities/door/types';
import type { ReaderDto } from '../entities/reader/api';
import { useDoorsQuery } from '../features/doors/list-doors/use-doors-query';
import { CreateReaderDialog } from '../features/readers/create-reader/create-reader-dialog';
import { useReadersQuery } from '../features/readers/list-readers/use-readers-query';
import { useRotateReaderKeyMutation } from '../features/readers/rotate-reader-key/use-rotate-reader-key-mutation';
import { useToggleReaderActiveMutation } from '../features/readers/toggle-reader-active/use-toggle-reader-active-mutation';
import { UpdateReaderDialog } from '../features/readers/update-reader/update-reader-dialog';
import { CodeBadge } from '../shared/ui/code-badge';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';
import { useNavigate } from 'react-router-dom';

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

function getDoorLabel(door: DoorDto | undefined, fallbackDoorId: string) {
    if (!door) return fallbackDoorId;
    return `${door.name} (${door.code})`;
}

export function ReadersPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const [createOpen, setCreateOpen] = useState(false);
    const [editingReader, setEditingReader] = useState<ReaderDto | null>(null);
    const [revealedApiKey, setRevealedApiKey] = useState<string | null>(null);

    const readersQuery = useReadersQuery({
        page: 1,
        pageSize: 50,
    });

    const doorsQuery = useDoorsQuery({
        page: 1,
        pageSize: 100,
    });

    const toggleMutation = useToggleReaderActiveMutation();
    const rotateKeyMutation = useRotateReaderKeyMutation();

    const readers = readersQuery.data?.items ?? [];

    const doorMap = useMemo(() => {
        const map = new Map<string, DoorDto>();

        for (const door of doorsQuery.data?.items ?? []) {
            map.set(door.id, door);
        }

        return map;
    }, [doorsQuery.data]);

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
                actions={
                    <Button
                        variant="contained"
                        startIcon={<AddOutlinedIcon />}
                        onClick={() => setCreateOpen(true)}
                        disabled={doorsQuery.isLoading || doorsQuery.isError}
                    >
                        Create reader
                    </Button>
                }
            />

            {revealedApiKey ? (
                <Alert severity="warning" onClose={() => setRevealedApiKey(null)}>
                    New API key generated. Copy it now, it will not be shown again:
                    <Box
                        component="code"
                        sx={{
                            display: 'block',
                            mt: 1,
                            wordBreak: 'break-all',
                        }}
                    >
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
                    description="Create reader devices to start monitoring access points."
                    action={
                        <Button
                            variant="contained"
                            startIcon={<AddOutlinedIcon />}
                            onClick={() => setCreateOpen(true)}
                            disabled={doorsQuery.isLoading || doorsQuery.isError}
                        >
                            Create reader
                        </Button>
                    }
                />
            ) : (
                <Grid container spacing={2.5}>
                    {readers.map((reader) => {
                        const online = isReaderOnline(reader);
                        const door = doorMap.get(reader.doorId);

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
                                                    <Box
                                                        component="button"
                                                        type="button"
                                                        onClick={() => navigate(`/admin/readers/${reader.id}`)}
                                                        sx={{
                                                            all: 'unset',
                                                            cursor: 'pointer',
                                                            maxWidth: '100%',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="h6"
                                                            noWrap
                                                            sx={{
                                                                color: 'text.primary',
                                                                transition: 'color 0.18s ease',
                                                                '&:hover': {
                                                                    color: 'primary.main',
                                                                },
                                                            }}
                                                        >
                                                            {reader.name}
                                                        </Typography>
                                                    </Box>
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
                                                Assigned door
                                            </Typography>
                                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                {getDoorLabel(door, reader.doorId)}
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

                                        <Box sx={{ height: 1, bgcolor: 'divider' }} />

                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <Button
                                                variant="outlined"
                                                startIcon={<EditOutlinedIcon />}
                                                onClick={() => setEditingReader(reader)}
                                                disabled={doorsQuery.isLoading || doorsQuery.isError}
                                            >
                                                Edit
                                            </Button>

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

            <CreateReaderDialog
                open={createOpen}
                doors={doorsQuery.data?.items ?? []}
                onCreated={(apiKey) => setRevealedApiKey(apiKey)}
                onClose={() => setCreateOpen(false)}
            />

            <UpdateReaderDialog
                open={Boolean(editingReader)}
                reader={editingReader}
                doors={doorsQuery.data?.items ?? []}
                onClose={() => setEditingReader(null)}
            />
        </PageContainer>
    );
}