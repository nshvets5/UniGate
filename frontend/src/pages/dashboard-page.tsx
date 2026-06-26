import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
    Box,
    Button,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AttemptDto } from '../entities/attempt/api';
import { useAttemptsQuery } from '../features/attempts/list-attempts/use-attempts-query';
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
import { DashboardHeroCard } from '../widgets/dashboard/dashboard-hero-card';
import { RecentActivityWidget } from '../widgets/dashboard/recent-activity-widget';
import { ReaderStatusOverview } from '../widgets/dashboard/reader-status-overview';
import { DashboardSystemHealthWidget } from '../widgets/dashboard/system-health-widget';

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

function formatNumber(value: number) {
    return new Intl.NumberFormat().format(value);
}

function isReaderOnline(lastSeenAt?: string | null) {
    if (!lastSeenAt) return false;

    const lastSeen = new Date(lastSeenAt).getTime();
    const diffMinutes = (Date.now() - lastSeen) / 1000 / 60;

    return diffMinutes <= 2;
}

export function DashboardPage() {
    const theme = useTheme();
    const navigate = useNavigate();

    const readersQuery = useReadersQuery({ page: 1, pageSize: 100 });
    const syncStatusQuery = useTimetableSyncStatusQuery();

    const auditQuery = useAuditEventsQuery({
        page: 1,
        pageSize: 6,
    });

    const recentAttemptsQuery = useAttemptsQuery({
        page: 1,
        pageSize: 6,
    });

    const totalAttemptsQuery = useAttemptsQuery({
        page: 1,
        pageSize: 1,
    });

    const allowedAttemptsQuery = useAttemptsQuery({
        isAllowed: true,
        page: 1,
        pageSize: 1,
    });

    const deniedAttemptsQuery = useAttemptsQuery({
        isAllowed: false,
        page: 1,
        pageSize: 1,
    });

    const readers = readersQuery.data?.items ?? [];
    const recentAttempts = recentAttemptsQuery.data?.items ?? [];
    const auditEvents = auditQuery.data?.items ?? [];

    const readerStats = useMemo(() => {
        const online = readers.filter((reader) => isReaderOnline(reader.lastSeenAt)).length;
        const active = readers.filter((reader) => reader.isActive).length;

        return {
            total: readers.length,
            active,
            online,
            offline: readers.length - online,
        };
    }, [readers]);

    const totalAttempts = totalAttemptsQuery.data?.totalCount ?? 0;
    const allowedAttempts = allowedAttemptsQuery.data?.totalCount ?? 0;
    const deniedAttempts = deniedAttemptsQuery.data?.totalCount ?? 0;

    const successRate =
        allowedAttempts + deniedAttempts > 0
            ? Math.round((allowedAttempts / (allowedAttempts + deniedAttempts)) * 100)
            : 0;

    const syncStatus = syncStatusQuery.data;
    const syncHasError = Boolean(syncStatus?.lastError);
    const syncHealthy =
        Boolean(syncStatus) &&
        syncStatus.enabled &&
        !syncStatus.isStale &&
        !syncHasError;

    const systemHealthy =
        readerStats.offline === 0 &&
        syncHealthy &&
        deniedAttemptsQuery.isSuccess;

    return (
        <PageContainer>
            <PageHeader
                title="Operational dashboard"
                subtitle="Real-time overview of access control infrastructure and system activity."
                actions={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <StatusChip
                            label={systemHealthy ? 'System healthy' : 'Needs attention'}
                            variant={systemHealthy ? 'success' : 'warning'}
                        />

                        <Button
                            variant="outlined"
                            startIcon={<SyncOutlinedIcon />}
                            onClick={() => {
                                void readersQuery.refetch();
                                void auditQuery.refetch();
                                void recentAttemptsQuery.refetch();
                                void totalAttemptsQuery.refetch();
                                void allowedAttemptsQuery.refetch();
                                void deniedAttemptsQuery.refetch();
                                void syncStatusQuery.refetch();
                            }}
                        >
                            Refresh
                        </Button>
                    </Stack>
                }
            />

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        xl: 'repeat(4, minmax(0, 1fr))',
                    },
                    gap: 2,
                }}
            >
                <DashboardHeroCard
                    title="Reader devices"
                    value={formatNumber(readerStats.total)}
                    subtitle={`${readerStats.online} online · ${readerStats.offline} offline`}
                    icon={<SensorsOutlinedIcon />}
                    tone={readerStats.offline > 0 ? 'warning' : 'success'}
                    trend="+2"
                    onClick={() => navigate('/admin/readers')}
                />

                <DashboardHeroCard
                    title="Access attempts"
                    value={formatNumber(totalAttempts)}
                    subtitle={`${formatNumber(allowedAttempts)} allowed · ${formatNumber(deniedAttempts)} denied`}
                    icon={<ShieldOutlinedIcon />}
                    tone={deniedAttempts > 0 ? 'info' : 'success'}
                    trend={`${successRate}%`}
                    onClick={() => navigate('/admin/attempts')}
                />

                <DashboardHeroCard
                    title="Timetable sync"
                    value={syncHealthy ? 'Healthy' : syncStatus?.isStale ? 'Stale' : syncHasError ? 'Error' : '—'}
                    subtitle={`Last success: ${formatDateTime(syncStatus?.lastSuccessUtc)}`}
                    icon={<SyncOutlinedIcon />}
                    tone={syncHealthy ? 'success' : 'warning'}
                    trend={syncHealthy ? 'OK' : '!'}
                    onClick={() => navigate('/admin/timetable/sync')}
                />

                <DashboardHeroCard
                    title="Audit events"
                    value={formatNumber(auditQuery.data?.totalCount ?? 0)}
                    subtitle="System and administrative activity"
                    icon={<HistoryOutlinedIcon />}
                    tone="primary"
                    trend="+12%"
                    onClick={() => navigate('/admin/audit')}
                />
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        xl: '1.25fr 0.85fr 0.8fr',
                    },
                    gap: 3,
                }}
            >
                <RecentActivityWidget
                    events={auditEvents}
                    isLoading={auditQuery.isLoading}
                    isError={auditQuery.isError}
                    onRetry={() => void auditQuery.refetch()}
                    onOpen={() => navigate('/admin/audit')}
                />

                <ReaderStatusOverview
                    total={readerStats.total}
                    online={readerStats.online}
                    offline={readerStats.offline}
                    active={readerStats.active}
                    onOpen={() => navigate('/admin/readers')}
                />

                <DashboardSystemHealthWidget
                    readersOffline={readerStats.offline}
                    syncHealthy={syncHealthy}
                    syncLoading={syncStatusQuery.isLoading}
                    attemptsHealthy={deniedAttemptsQuery.isSuccess}
                    onOpen={() => navigate('/admin/monitoring')}
                />
            </Box>

            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        xl: '1.35fr 0.65fr',
                    },
                    gap: 3,
                }}
            >
                <SyncAndAttemptsWidget
                    syncHealthy={syncHealthy}
                    syncStatus={syncStatus}
                    attempts={recentAttempts}
                    attemptsLoading={recentAttemptsQuery.isLoading}
                    attemptsError={recentAttemptsQuery.isError}
                    onOpenSync={() => navigate('/admin/timetable/sync')}
                    onOpenAttempts={() => navigate('/admin/attempts')}
                />

                <QuickActionsWidget />
            </Box>
        </PageContainer>
    );
}

function ActivityRow({ event }: { event: any }) {
    const variant = getActivityVariant(event.type);

    return (
        <Box sx={{ px: 2.5, py: 1.8 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <IconBubble tone={variant} compact>
                    {variant === 'error' ? <WarningAmberOutlinedIcon /> : <AssignmentTurnedInOutlinedIcon />}
                </IconBubble>

                <Stack minWidth={0} flex={1}>
                    <Typography variant="subtitle2" noWrap>
                        {event.type}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" noWrap>
                        {event.resourceType ?? 'System'} · {event.actorSubject || event.actorProvider || 'System'}
                    </Typography>
                </Stack>

                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    {formatDateTime(event.occurredAt)}
                </Typography>
            </Stack>
        </Box>
    );
}

function SyncAndAttemptsWidget({
                                   syncHealthy,
                                   syncStatus,
                                   attempts,
                                   attemptsLoading,
                                   attemptsError,
                                   onOpenSync,
                                   onOpenAttempts,
                               }: {
    syncHealthy: boolean;
    syncStatus: any;
    attempts: AttemptDto[];
    attemptsLoading: boolean;
    attemptsError: boolean;
    onOpenSync: () => void;
    onOpenAttempts: () => void;
}) {
    const theme = useTheme();

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', lg: '0.9fr 1.1fr' },
                }}
            >
                <Box sx={{ p: 3, borderRight: { lg: '1px solid' }, borderColor: 'divider' }}>
                    <Stack spacing={2.5}>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <IconBubble tone={syncHealthy ? 'success' : 'warning'}>
                                {syncHealthy ? <SyncOutlinedIcon /> : <WarningAmberOutlinedIcon />}
                            </IconBubble>

                            <Stack>
                                <Typography variant="subtitle1">Timetable synchronization</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Rules synchronization health.
                                </Typography>
                            </Stack>
                        </Stack>

                        <Box
                            sx={{
                                width: 132,
                                height: 132,
                                borderRadius: '50%',
                                mx: 'auto',
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha(
                                    syncHealthy ? theme.palette.success.main : theme.palette.warning.main,
                                    0.1
                                ),
                                color: syncHealthy ? 'success.main' : 'warning.main',
                            }}
                        >
                            {syncHealthy ? (
                                <CheckCircleOutlineOutlinedIcon sx={{ fontSize: 58 }} />
                            ) : (
                                <WarningAmberOutlinedIcon sx={{ fontSize: 58 }} />
                            )}
                        </Box>

                        <Stack textAlign="center">
                            <Typography variant="subtitle2">
                                {syncHealthy ? 'Synchronization is healthy' : 'Synchronization needs attention'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Last success: {formatDateTime(syncStatus?.lastSuccessUtc)}
                            </Typography>
                        </Stack>

                        <Button variant="outlined" onClick={onOpenSync}>
                            Open sync diagnostics
                        </Button>
                    </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Stack>
                                <Typography variant="subtitle1">Recent access decisions</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Latest reader and emulator attempts.
                                </Typography>
                            </Stack>

                            <Button size="small" onClick={onOpenAttempts}>
                                View all
                            </Button>
                        </Stack>

                        {attemptsLoading ? (
                            <LoadingState title="Loading attempts" />
                        ) : attemptsError ? (
                            <ErrorState title="Failed to load attempts" />
                        ) : attempts.length === 0 ? (
                            <EmptyState title="No attempts yet" />
                        ) : (
                            <Stack spacing={1.1}>
                                {attempts.slice(0, 5).map((attempt) => (
                                    <RecentAttemptRow key={attempt.id} attempt={attempt} />
                                ))}
                            </Stack>
                        )}
                    </Stack>
                </Box>
            </Box>
        </SectionCard>
    );
}

function QuickActionsWidget() {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Access Workspace',
            icon: <ApartmentOutlinedIcon />,
            to: '/admin/zones',
            tone: 'primary' as Tone,
        },
        {
            label: 'Access Attempts',
            icon: <RuleOutlinedIcon />,
            to: '/admin/attempts',
            tone: 'error' as Tone,
        },
        {
            label: 'Readers',
            icon: <SensorsOutlinedIcon />,
            to: '/admin/readers',
            tone: 'info' as Tone,
        },
        {
            label: 'Audit Log',
            icon: <HistoryOutlinedIcon />,
            to: '/admin/audit',
            tone: 'warning' as Tone,
        },
        {
            label: 'Import Timetable',
            icon: <CalendarMonthOutlinedIcon />,
            to: '/admin/timetable/import',
            tone: 'primary' as Tone,
        },
        {
            label: 'Timetable Sync',
            icon: <SyncOutlinedIcon />,
            to: '/admin/timetable/sync',
            tone: 'success' as Tone,
        },
        {
            label: 'Reader Emulator',
            icon: <LoginOutlinedIcon />,
            to: '/admin/emulator',
            tone: 'info' as Tone,
        },
    ];

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <WidgetHeader
                icon={<ShieldOutlinedIcon />}
                title="Quick actions"
                subtitle="Common administrative workflows."
            />

            <Divider />

            <Box
                sx={{
                    p: 2.5,
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 1.25,
                }}
            >
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant="outlined"
                        onClick={() => navigate(action.to)}
                        startIcon={action.icon}
                        sx={{
                            justifyContent: 'flex-start',
                            py: 1.15,
                        }}
                    >
                        {action.label}
                    </Button>
                ))}
            </Box>
        </SectionCard>
    );
}

function WidgetHeader({
                          icon,
                          title,
                          subtitle,
                          actionLabel,
                          onAction,
                      }: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <Box sx={{ p: 3 }}>
            <Stack direction="row" justifyContent="space-between" spacing={2}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <IconBubble tone="primary">{icon}</IconBubble>

                    <Stack>
                        <Typography variant="subtitle1">{title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </Stack>
                </Stack>

                {actionLabel && onAction ? (
                    <Button variant="outlined" onClick={onAction}>
                        {actionLabel}
                    </Button>
                ) : null}
            </Stack>
        </Box>
    );
}

function RecentAttemptRow({ attempt }: { attempt: AttemptDto }) {
    return (
        <Box
            sx={{
                p: 1.45,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
            }}
        >
            <Stack direction="row" justifyContent="space-between" spacing={1.5} alignItems="center">
                <Stack minWidth={0}>
                    <Typography
                        variant="body2"
                        fontWeight={800}
                        noWrap
                        sx={{
                            fontFamily:
                                'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        }}
                    >
                        {attempt.credentialValue}
                    </Typography>

                    <Typography variant="caption" color="text.secondary" noWrap>
                        {attempt.credentialType.toUpperCase()} · {formatDateTime(attempt.occurredAt)}
                    </Typography>
                </Stack>

                <Stack direction="row" spacing={0.75}>
                    <StatusChip
                        label={attempt.isAllowed ? 'ALLOW' : 'DENY'}
                        variant={attempt.isAllowed ? 'success' : 'error'}
                    />
                </Stack>
            </Stack>
        </Box>
    );
}

function IconBubble({
                        children,
                        tone,
                        compact,
                    }: {
    children: React.ReactNode;
    tone: Tone;
    compact?: boolean;
}) {
    const theme = useTheme();
    const color = getToneColor(theme, tone);

    return (
        <Box
            sx={{
                width: compact ? 38 : 46,
                height: compact ? 38 : 46,
                borderRadius: compact ? 2.5 : 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(color, 0.12),
                color,
                flexShrink: 0,
            }}
        >
            {children}
        </Box>
    );
}

function getActivityVariant(type: string): Tone {
    const normalized = type.toLowerCase();

    if (
        normalized.includes('failed') ||
        normalized.includes('denied') ||
        normalized.includes('alert') ||
        normalized.includes('offline') ||
        normalized.includes('suspicious')
    ) {
        return 'error';
    }

    if (normalized.includes('updated') || normalized.includes('changed')) {
        return 'info';
    }

    if (normalized.includes('created') || normalized.includes('provisioned')) {
        return 'success';
    }

    return 'primary';
}

type Tone = 'primary' | 'success' | 'warning' | 'error' | 'info';

function getToneColor(theme: any, tone: Tone) {
    switch (tone) {
        case 'success':
            return theme.palette.success.main;
        case 'warning':
            return theme.palette.warning.main;
        case 'error':
            return theme.palette.error.main;
        case 'info':
            return theme.palette.info.main;
        default:
            return theme.palette.primary.main;
    }
}