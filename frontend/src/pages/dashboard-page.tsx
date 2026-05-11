import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
    Box,
    Button,
    Divider,
    Grid,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuditEventsQuery } from '../features/audit/list-audit-events/use-audit-events-query';
import { useReadersQuery } from '../features/readers/list-readers/use-readers-query';
import { useTimetableSyncStatusQuery } from '../features/timetable/sync-status/use-timetable-sync-status-query';
import { EmptyState } from '../shared/ui/empty-state';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

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

function getAuditVariant(
    type: string
): 'success' | 'warning' | 'error' | 'info' | 'default' {
    const normalized = type.toLowerCase();

    if (normalized.includes('created') || normalized.includes('provisioned')) {
        return 'success';
    }

    if (normalized.includes('updated') || normalized.includes('changed')) {
        return 'info';
    }

    if (normalized.includes('deleted') || normalized.includes('deactivated')) {
        return 'warning';
    }

    if (
        normalized.includes('failed') ||
        normalized.includes('denied') ||
        normalized.includes('alert')
    ) {
        return 'error';
    }

    return 'default';
}

export function DashboardPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    const readersQuery = useReadersQuery({
        page: 1,
        pageSize: 100,
    });

    const syncStatusQuery = useTimetableSyncStatusQuery();

    const auditQuery = useAuditEventsQuery({
        page: 1,
        pageSize: 6,
    });

    const readers = readersQuery.data?.items ?? [];

    const readerStats = useMemo(() => {
        const online = readers.filter((reader) => isReaderOnline(reader.lastSeenAt)).length;
        const active = readers.filter((reader) => reader.isActive).length;

        return {
            total: readers.length,
            online,
            offline: readers.length - online,
            active,
        };
    }, [readers]);

    const syncStatus = syncStatusQuery.data;
    const syncHasError = Boolean(syncStatus?.lastError);
    const syncHealthy =
        Boolean(syncStatus) &&
        syncStatus.enabled &&
        !syncStatus.isStale &&
        !syncHasError;

    const overviewCards = [
        {
            title: 'Reader devices',
            value: readerStats.total,
            subtitle: `${readerStats.online} online · ${readerStats.offline} offline`,
            icon: <SensorsOutlinedIcon />,
            variant: readerStats.offline > 0 ? 'warning' : 'success',
            action: () => navigate('/admin/readers'),
        },
        {
            title: 'Active readers',
            value: readerStats.active,
            subtitle: 'Readers enabled for scan processing',
            icon: <DevicesOutlinedIcon />,
            variant: 'info',
            action: () => navigate('/admin/readers'),
        },
        {
            title: 'Timetable sync',
            value: syncStatus
                ? syncHealthy
                    ? 'Healthy'
                    : syncStatus.isStale
                        ? 'Stale'
                        : syncHasError
                            ? 'Error'
                            : syncStatus.enabled
                                ? 'Enabled'
                                : 'Disabled'
                : '—',
            subtitle: syncStatus
                ? `Last success: ${formatDateTime(syncStatus.lastSuccessUtc)}`
                : 'Status is not available',
            icon: <SyncOutlinedIcon />,
            variant: syncHealthy ? 'success' : syncHasError || syncStatus?.isStale ? 'warning' : 'default',
            action: () => navigate('/admin/timetable/sync'),
        },
        {
            title: 'Recent audit events',
            value: auditQuery.data?.totalCount ?? 0,
            subtitle: 'Administrative and system activity',
            icon: <HistoryOutlinedIcon />,
            variant: 'default',
            action: () => navigate('/admin/audit'),
        },
    ] as const;

    return (
        <PageContainer>
            <PageHeader
                title="Operational dashboard"
                subtitle="Central overview of access infrastructure, devices, timetable sync and system activity."
            />

            <Grid container spacing={2}>
                {overviewCards.map((card) => (
                    <Grid key={card.title} size={{ xs: 12, sm: 6, xl: 3 }}>
                        <SectionCard
                            sx={{
                                height: '100%',
                                cursor: 'pointer',
                                transition: 'transform 0.18s ease, border-color 0.18s ease, background-color 0.18s ease',
                                '&:hover': {
                                    transform: 'translateY(-2px)',
                                    borderColor: alpha(theme.palette.primary.main, 0.32),
                                    bgcolor: alpha(theme.palette.primary.main, 0.025),
                                },
                            }}
                            onClick={card.action}
                        >
                            <Stack spacing={2}>
                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                    <Box
                                        sx={{
                                            width: 46,
                                            height: 46,
                                            borderRadius: 3,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor:
                                                card.variant === 'success'
                                                    ? alpha(theme.palette.success.main, 0.12)
                                                    : card.variant === 'warning'
                                                        ? alpha(theme.palette.warning.main, 0.12)
                                                        : card.variant === 'info'
                                                            ? alpha(theme.palette.info.main, 0.12)
                                                            : alpha(theme.palette.primary.main, 0.1),
                                            color:
                                                card.variant === 'success'
                                                    ? 'success.main'
                                                    : card.variant === 'warning'
                                                        ? 'warning.main'
                                                        : card.variant === 'info'
                                                            ? 'info.main'
                                                            : 'primary.main',
                                        }}
                                    >
                                        {card.icon}
                                    </Box>

                                    <StatusChip
                                        label={
                                            card.variant === 'success'
                                                ? 'Healthy'
                                                : card.variant === 'warning'
                                                    ? 'Attention'
                                                    : card.variant === 'info'
                                                        ? 'Info'
                                                        : 'Overview'
                                        }
                                        variant={
                                            card.variant === 'success'
                                                ? 'success'
                                                : card.variant === 'warning'
                                                    ? 'warning'
                                                    : card.variant === 'info'
                                                        ? 'info'
                                                        : 'default'
                                        }
                                    />
                                </Stack>

                                <Stack spacing={0.5}>
                                    <Typography variant="body2" color="text.secondary">
                                        {card.title}
                                    </Typography>

                                    <Typography variant={typeof card.value === 'number' ? 'h4' : 'h5'}>
                                        {card.value}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        {card.subtitle}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </SectionCard>
                    </Grid>
                ))}
            </Grid>

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, xl: 7 }}>
                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2.5,
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                    }}
                                >
                                    <HistoryOutlinedIcon />
                                </Box>

                                <Stack>
                                    <Typography variant="subtitle1">Recent system activity</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Latest audit events generated by directory, access and device workflows.
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>

                        <Divider />

                        {auditQuery.isLoading ? (
                            <LoadingState
                                title="Loading audit events"
                                description="Please wait while recent activity is being loaded."
                            />
                        ) : auditQuery.isError ? (
                            <ErrorState
                                title="Failed to load audit events"
                                description="Recent audit activity could not be loaded."
                                onRetry={() => void auditQuery.refetch()}
                            />
                        ) : !auditQuery.data || auditQuery.data.items.length === 0 ? (
                            <EmptyState
                                title="No recent activity"
                                description="Audit events will appear here after administrative or system actions."
                            />
                        ) : (
                            <Stack spacing={0} divider={<Divider />}>
                                {auditQuery.data.items.map((event) => (
                                    <Box
                                        key={event.id}
                                        sx={{
                                            p: 2.5,
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: '1fr',
                                                md: 'minmax(0, 1fr) 170px',
                                            },
                                            gap: 2,
                                            alignItems: 'center',
                                            transition: 'background-color 0.18s ease',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.03),
                                            },
                                        }}
                                    >
                                        <Stack spacing={0.75} minWidth={0}>
                                            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                                <StatusChip
                                                    label={event.type}
                                                    variant={getAuditVariant(event.type)}
                                                />

                                                {event.resourceType ? (
                                                    <StatusChip
                                                        label={event.resourceType}
                                                        variant="default"
                                                    />
                                                ) : null}
                                            </Stack>

                                            <Typography variant="body2" color="text.secondary" noWrap>
                                                Actor: {event.actorSubject || event.actorProvider || 'System'}
                                            </Typography>
                                        </Stack>

                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            sx={{ textAlign: { xs: 'left', md: 'right' } }}
                                        >
                                            {formatDateTime(event.occurredAt)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </SectionCard>
                </Grid>

                <Grid size={{ xs: 12, xl: 5 }}>
                    <Stack spacing={3}>
                        <SectionCard>
                            <Stack spacing={2}>
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 2.5,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: syncHealthy
                                                ? alpha(theme.palette.success.main, 0.12)
                                                : alpha(theme.palette.warning.main, 0.12),
                                            color: syncHealthy ? 'success.main' : 'warning.main',
                                        }}
                                    >
                                        {syncHealthy ? (
                                            <SyncOutlinedIcon />
                                        ) : (
                                            <WarningAmberOutlinedIcon />
                                        )}
                                    </Box>

                                    <Stack>
                                        <Typography variant="subtitle1">Timetable synchronization</Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            Access rules synchronization health.
                                        </Typography>
                                    </Stack>
                                </Stack>

                                {syncStatusQuery.isLoading ? (
                                    <Typography variant="body2" color="text.secondary">
                                        Loading synchronization status...
                                    </Typography>
                                ) : syncStatusQuery.isError || !syncStatus ? (
                                    <AlertLikeBox
                                        title="Sync status unavailable"
                                        description="Open synchronization page to retry loading status."
                                        action={() => navigate('/admin/timetable/sync')}
                                    />
                                ) : (
                                    <>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                            <StatusChip
                                                label={syncStatus.enabled ? 'Enabled' : 'Disabled'}
                                                variant={syncStatus.enabled ? 'success' : 'warning'}
                                            />
                                            <StatusChip
                                                label={syncStatus.isStale ? 'Stale' : 'Fresh'}
                                                variant={syncStatus.isStale ? 'warning' : 'success'}
                                            />
                                            <StatusChip
                                                label={syncHasError ? 'Error' : 'Healthy'}
                                                variant={syncHasError ? 'error' : 'success'}
                                            />
                                        </Stack>

                                        <Divider />

                                        <Stack spacing={1}>
                                            <Typography variant="body2" color="text.secondary">
                                                Last success
                                            </Typography>
                                            <Typography variant="body2">
                                                {formatDateTime(syncStatus.lastSuccessUtc)}
                                            </Typography>

                                            <Typography variant="body2" color="text.secondary">
                                                Updated rules
                                            </Typography>
                                            <Typography variant="h5">
                                                {syncStatus.lastUpdatedRulesCount}
                                            </Typography>
                                        </Stack>

                                        <Button
                                            variant="outlined"
                                            onClick={() => navigate('/admin/timetable/sync')}
                                        >
                                            Open sync diagnostics
                                        </Button>
                                    </>
                                )}
                            </Stack>
                        </SectionCard>

                        <SectionCard>
                            <Stack spacing={2}>
                                <Typography variant="subtitle1">Quick actions</Typography>

                                <Box
                                    sx={{
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                                        gap: 1.5,
                                    }}
                                >
                                    <Button
                                        variant="outlined"
                                        startIcon={<ApartmentOutlinedIcon />}
                                        onClick={() => navigate('/admin/zones')}
                                    >
                                        Access workspace
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<SensorsOutlinedIcon />}
                                        onClick={() => navigate('/admin/readers')}
                                    >
                                        Readers
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<CalendarMonthOutlinedIcon />}
                                        onClick={() => navigate('/admin/timetable/import')}
                                    >
                                        Import timetable
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<LoginOutlinedIcon />}
                                        onClick={() => navigate('/admin/emulator')}
                                    >
                                        Reader emulator
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<RuleOutlinedIcon />}
                                        onClick={() => navigate('/admin/attempts')}
                                    >
                                        Access attempts
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        startIcon={<HistoryOutlinedIcon />}
                                        onClick={() => navigate('/admin/audit')}
                                    >
                                        Audit log
                                    </Button>
                                </Box>
                            </Stack>
                        </SectionCard>
                    </Stack>
                </Grid>
            </Grid>
        </PageContainer>
    );
}

type AlertLikeBoxProps = {
    title: string;
    description: string;
    action: () => void;
};

function AlertLikeBox({ title, description, action }: AlertLikeBoxProps) {
    return (
        <Box
            sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Stack spacing={1}>
                <Typography variant="subtitle2">{title}</Typography>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
                <Button variant="outlined" size="small" onClick={action}>
                    Open diagnostics
                </Button>
            </Stack>
        </Box>
    );
}