import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import { Box, Button, Stack } from '@mui/material';
import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAttemptsQuery } from '../features/attempts/list-attempts/use-attempts-query';
import { useAuditEventsQuery } from '../features/audit/list-audit-events/use-audit-events-query';
import { useReadersQuery } from '../features/readers/list-readers/use-readers-query';
import { useTimetableSyncStatusQuery } from '../features/timetable/sync-status/use-timetable-sync-status-query';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { StatusChip } from '../shared/ui/status-chip';
import { DashboardHeroCard } from '../widgets/dashboard/dashboard-hero-card';
import { DashboardSystemHealthWidget } from '../widgets/dashboard/system-health-widget';
import { QuickActionsWidget } from '../widgets/dashboard/quick-actions-widget';
import { ReaderStatusOverview } from '../widgets/dashboard/reader-status-overview';
import { RecentActivityWidget } from '../widgets/dashboard/recent-activity-widget';
import { SyncAttemptsWidget } from '../widgets/dashboard/sync-attempts-widget';

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
    const auditEvents = auditQuery.data?.items ?? [];
    const recentAttempts = recentAttemptsQuery.data?.items ?? [];

    const readerStats = useMemo(() => {
        const online = readers.filter((reader) =>
            isReaderOnline(reader.lastSeenAt)
        ).length;

        const active = readers.filter((reader) => reader.isActive).length;

        return {
            total: readers.length,
            online,
            offline: readers.length - online,
            active,
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

    const handleRefresh = () => {
        void readersQuery.refetch();
        void syncStatusQuery.refetch();
        void auditQuery.refetch();
        void recentAttemptsQuery.refetch();
        void totalAttemptsQuery.refetch();
        void allowedAttemptsQuery.refetch();
        void deniedAttemptsQuery.refetch();
    };

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
                            onClick={handleRefresh}
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
                    trend={readerStats.offline > 0 ? 'Attention' : 'Healthy'}
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
                    value={
                        syncHealthy
                            ? 'Healthy'
                            : syncStatus?.isStale
                                ? 'Stale'
                                : syncHasError
                                    ? 'Error'
                                    : '—'
                    }
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
                    trend="Activity"
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
                <SyncAttemptsWidget
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