import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
    Box,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ReaderDto } from '../../entities/reader/api';
import type { TimetableSyncStatusDto } from '../../entities/timetable/api';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    readers: ReaderDto[];
    syncStatus?: TimetableSyncStatusDto;
    readersLoading?: boolean;
    syncLoading?: boolean;
};

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

function isReaderOnline(lastSeenAt?: string | null) {
    if (!lastSeenAt) return false;

    const lastSeen = new Date(lastSeenAt).getTime();
    const diffMinutes = (Date.now() - lastSeen) / 1000 / 60;

    return diffMinutes <= 2;
}

export function SystemStatusWidget({
                                       readers,
                                       syncStatus,
                                       readersLoading,
                                       syncLoading,
                                   }: Props) {
    const theme = useTheme();

    const onlineReaders = readers.filter((reader) =>
        isReaderOnline(reader.lastSeenAt)
    ).length;

    const offlineReaders = readers.length - onlineReaders;
    const hasOfflineReaders = offlineReaders > 0;

    const syncHasError = Boolean(syncStatus?.lastError);
    const syncHealthy =
        Boolean(syncStatus) &&
        syncStatus.enabled &&
        !syncStatus.isStale &&
        !syncHasError;

    const overallHealthy =
        !readersLoading &&
        !syncLoading &&
        !hasOfflineReaders &&
        syncHealthy;

    const items = [
        {
            label: 'API connectivity',
            description: 'Frontend is connected to UniGate backend API.',
            statusLabel: 'Available',
            variant: 'success' as const,
            icon: <CheckCircleOutlineOutlinedIcon />,
        },
        {
            label: 'Reader fleet',
            description: `${onlineReaders}/${readers.length} readers are currently online.`,
            statusLabel: readersLoading
                ? 'Loading'
                : hasOfflineReaders
                    ? `${offlineReaders} offline`
                    : 'Online',
            variant: readersLoading
                ? ('default' as const)
                : hasOfflineReaders
                    ? ('warning' as const)
                    : ('success' as const),
            icon: <SensorsOutlinedIcon />,
        },
        {
            label: 'Timetable sync',
            description: syncStatus
                ? `Last success: ${formatDateTime(syncStatus.lastSuccessUtc)}`
                : 'Synchronization status is not available yet.',
            statusLabel: syncLoading
                ? 'Loading'
                : !syncStatus
                    ? 'Unknown'
                    : syncHasError
                        ? 'Error'
                        : syncStatus.isStale
                            ? 'Stale'
                            : syncStatus.enabled
                                ? 'Healthy'
                                : 'Disabled',
            variant: syncLoading || !syncStatus
                ? ('default' as const)
                : syncHasError
                    ? ('error' as const)
                    : syncStatus.isStale || !syncStatus.enabled
                        ? ('warning' as const)
                        : ('success' as const),
            icon: <SyncOutlinedIcon />,
        },
    ];

    return (
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
                            bgcolor: overallHealthy
                                ? alpha(theme.palette.success.main, 0.12)
                                : alpha(theme.palette.warning.main, 0.12),
                            color: overallHealthy ? 'success.main' : 'warning.main',
                        }}
                    >
                        {overallHealthy ? (
                            <CheckCircleOutlineOutlinedIcon />
                        ) : (
                            <WarningAmberOutlinedIcon />
                        )}
                    </Box>

                    <Stack spacing={0.35}>
                        <Typography variant="subtitle1">System status</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Operational health summary for core UniGate subsystems.
                        </Typography>
                    </Stack>
                </Stack>
            </Box>

            <Divider />

            <Stack spacing={0} divider={<Divider />}>
                {items.map((item) => (
                    <Box
                        key={item.label}
                        sx={{
                            p: 2.5,
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '42px minmax(0, 1fr) auto',
                            },
                            gap: 1.5,
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2.5,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor:
                                    item.variant === 'success'
                                        ? alpha(theme.palette.success.main, 0.12)
                                        : item.variant === 'warning'
                                            ? alpha(theme.palette.warning.main, 0.12)
                                            : item.variant === 'error'
                                                ? alpha(theme.palette.error.main, 0.12)
                                                : alpha(theme.palette.primary.main, 0.1),
                                color:
                                    item.variant === 'success'
                                        ? 'success.main'
                                        : item.variant === 'warning'
                                            ? 'warning.main'
                                            : item.variant === 'error'
                                                ? 'error.main'
                                                : 'primary.main',
                            }}
                        >
                            {item.variant === 'error' ? (
                                <ErrorOutlineOutlinedIcon />
                            ) : (
                                item.icon
                            )}
                        </Box>

                        <Stack spacing={0.35} minWidth={0}>
                            <Typography variant="subtitle2">{item.label}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {item.description}
                            </Typography>
                        </Stack>

                        <StatusChip
                            label={item.statusLabel}
                            variant={item.variant}
                        />
                    </Box>
                ))}
            </Stack>
        </SectionCard>
    );
}