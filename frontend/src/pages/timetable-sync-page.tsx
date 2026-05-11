import AutorenewOutlinedIcon from '@mui/icons-material/AutorenewOutlined';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useSyncTimetableNowMutation } from '../features/timetable/sync-now/use-sync-timetable-now-mutation';
import { useTimetableSyncStatusQuery } from '../features/timetable/sync-status/use-timetable-sync-status-query';
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

export function TimetableSyncPage() {
    const theme = useTheme();
    const [successVisible, setSuccessVisible] = useState(false);

    const statusQuery = useTimetableSyncStatusQuery();
    const syncMutation = useSyncTimetableNowMutation();

    const status = statusQuery.data;
    const hasError = Boolean(status?.lastError);
    const isHealthy = Boolean(status) && status.enabled && !status.isStale && !hasError;

    const handleSyncNow = async () => {
        setSuccessVisible(false);
        await syncMutation.mutateAsync();
        setSuccessVisible(true);
        await statusQuery.refetch();
    };

    return (
        <PageContainer>
            <PageHeader
                title="Timetable synchronization"
                subtitle="Monitor synchronization between timetable snapshots and access control rules."
                actions={
                    <Button
                        variant="contained"
                        startIcon={
                            syncMutation.isPending ? (
                                <CircularProgress size={18} />
                            ) : (
                                <SyncOutlinedIcon />
                            )
                        }
                        onClick={() => void handleSyncNow()}
                        disabled={syncMutation.isPending || !status?.enabled}
                    >
                        Sync now
                    </Button>
                }
            />

            {successVisible ? (
                <Alert severity="success" onClose={() => setSuccessVisible(false)}>
                    Timetable synchronization has been requested successfully.
                </Alert>
            ) : null}

            {syncMutation.isError ? (
                <Alert severity="error">
                    Failed to start timetable synchronization. Please try again later.
                </Alert>
            ) : null}

            {statusQuery.isLoading ? (
                <LoadingState
                    title="Loading synchronization status"
                    description="Please wait while timetable sync status is being loaded."
                />
            ) : statusQuery.isError || !status ? (
                <ErrorState
                    title="Failed to load synchronization status"
                    description="Timetable sync status could not be loaded from the server."
                    onRetry={() => void statusQuery.refetch()}
                />
            ) : (
                <>
                    <SectionCard>
                        <Stack spacing={2.5}>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                alignItems={{ xs: 'flex-start', md: 'center' }}
                                gap={2}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 58,
                                            height: 58,
                                            borderRadius: 4,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: !status.enabled
                                                ? alpha(theme.palette.warning.main, 0.12)
                                                : hasError
                                                    ? alpha(theme.palette.error.main, 0.12)
                                                    : status.isStale
                                                        ? alpha(theme.palette.warning.main, 0.12)
                                                        : alpha(theme.palette.success.main, 0.12),
                                            color: !status.enabled
                                                ? 'warning.main'
                                                : hasError
                                                    ? 'error.main'
                                                    : status.isStale
                                                        ? 'warning.main'
                                                        : 'success.main',
                                        }}
                                    >
                                        {!status.enabled ? (
                                            <AutorenewOutlinedIcon />
                                        ) : hasError ? (
                                            <ErrorOutlineOutlinedIcon />
                                        ) : status.isStale ? (
                                            <AutorenewOutlinedIcon />
                                        ) : (
                                            <CheckCircleOutlineOutlinedIcon />
                                        )}
                                    </Box>

                                    <Stack spacing={0.75}>
                                        <Typography variant="h6">
                                            {!status.enabled
                                                ? 'Synchronization is disabled'
                                                : hasError
                                                    ? 'Last synchronization failed'
                                                    : status.isStale
                                                        ? 'Synchronization is stale'
                                                        : 'Synchronization is healthy'}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            Status is refreshed automatically every 15 seconds.
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <StatusChip
                                        label={status.enabled ? 'Enabled' : 'Disabled'}
                                        variant={status.enabled ? 'success' : 'warning'}
                                    />
                                    <StatusChip
                                        label={status.isStale ? 'Stale' : 'Fresh'}
                                        variant={status.isStale ? 'warning' : 'success'}
                                    />
                                    <StatusChip
                                        label={hasError ? 'Error' : 'Healthy'}
                                        variant={hasError ? 'error' : 'success'}
                                    />
                                </Stack>
                            </Stack>

                            {status.lastError ? (
                                <Alert severity="error">{status.lastError}</Alert>
                            ) : null}
                        </Stack>
                    </SectionCard>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                            gap: 2,
                        }}
                    >
                        <SectionCard>
                            <Typography variant="body2" color="text.secondary">
                                Last run
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                {formatDateTime(status.lastRunUtc)}
                            </Typography>
                        </SectionCard>

                        <SectionCard>
                            <Typography variant="body2" color="text.secondary">
                                Last success
                            </Typography>
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                {formatDateTime(status.lastSuccessUtc)}
                            </Typography>
                        </SectionCard>

                        <SectionCard>
                            <Typography variant="body2" color="text.secondary">
                                Updated rules
                            </Typography>
                            <Typography variant="h4" sx={{ mt: 1 }}>
                                {status.lastUpdatedRulesCount}
                            </Typography>
                        </SectionCard>
                    </Box>

                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ p: 3 }}>
                            <Typography variant="subtitle1">Synchronization diagnostics</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                This view tracks timetable-to-access synchronization health and manual execution requests.
                            </Typography>
                        </Box>

                        <Divider />

                        <Stack spacing={0} divider={<Divider />}>
                            {[
                                ['Enabled', status.enabled ? 'Yes' : 'No'],
                                ['Run on startup', status.runOnStartup ? 'Yes' : 'No'],
                                ['Interval', `${status.intervalSeconds}s`],
                                ['Jitter', `${status.jitterSeconds}s`],
                                ['Last run', formatDateTime(status.lastRunUtc)],
                                ['Last success', formatDateTime(status.lastSuccessUtc)],
                                ['Updated rules', String(status.lastUpdatedRulesCount)],
                                ['Age', status.ageSeconds !== null ? `${status.ageSeconds}s` : '—'],
                                ['Stale after', `${status.staleAfterSeconds}s`],
                                ['Stale', status.isStale ? 'Yes' : 'No'],
                                ['Last error', status.lastError ?? '—'],
                            ].map(([label, value]) => (
                                <Box
                                    key={label}
                                    sx={{
                                        p: 2.5,
                                        display: 'grid',
                                        gridTemplateColumns: { xs: '1fr', md: '220px minmax(0, 1fr)' },
                                        gap: 1.5,
                                    }}
                                >
                                    <Typography variant="body2" color="text.secondary">
                                        {label}
                                    </Typography>
                                    <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                        {value}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </SectionCard>
                </>
            )}
        </PageContainer>
    );
}