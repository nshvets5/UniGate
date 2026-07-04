import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import {
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { alpha, useTheme } from '@mui/material/styles';
import type { AttemptDto } from '../../entities/attempt/api';
import { EmptyState } from '../../shared/ui/empty-state';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { SectionCard } from '../../shared/ui/section-card';
import {
    DashboardIconBubble,
} from './dashboard-ui';
import { RecentAttemptRow } from './recent-attempt-row';

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

type Props = {
    syncHealthy: boolean;
    syncStatus: any;
    attempts: AttemptDto[];
    attemptsLoading: boolean;
    attemptsError: boolean;
    onOpenSync: () => void;
    onOpenAttempts: () => void;
};

export function SyncAttemptsWidget({
                                       syncHealthy,
                                       syncStatus,
                                       attempts,
                                       attemptsLoading,
                                       attemptsError,
                                       onOpenSync,
                                       onOpenAttempts,
                                   }: Props) {
    const theme = useTheme();
    const { t } = useTranslation();

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        lg: '0.9fr 1.1fr',
                    },
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        borderRight: {
                            lg: '1px solid',
                        },
                        borderColor: 'divider',
                    }}
                >
                    <Stack spacing={2.5}>
                        <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                        >
                            <DashboardIconBubble
                                tone={
                                    syncHealthy
                                        ? 'success'
                                        : 'warning'
                                }
                            >
                                {syncHealthy ? (
                                    <SyncOutlinedIcon />
                                ) : (
                                    <WarningAmberOutlinedIcon />
                                )}
                            </DashboardIconBubble>

                            <Stack>
                                <Typography variant="subtitle1">
                                    {t('dashboard.timetableSync')}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t('dashboard.systemHealthSubtitle')}
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
                                    syncHealthy
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main,
                                    0.1
                                ),
                                color: syncHealthy
                                    ? 'success.main'
                                    : 'warning.main',
                            }}
                        >
                            {syncHealthy ? (
                                <CheckCircleOutlineOutlinedIcon
                                    sx={{
                                        fontSize: 58,
                                    }}
                                />
                            ) : (
                                <WarningAmberOutlinedIcon
                                    sx={{
                                        fontSize: 58,
                                    }}
                                />
                            )}
                        </Box>

                        <Stack textAlign="center">
                            <Typography variant="subtitle2">
                                {syncHealthy
                                    ? t('dashboard.systemHealthy')
                                    : t('dashboard.needsAttention')}
                            </Typography>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                            >
                                {t('dashboard.lastSuccess')}:{' '}
                                {formatDateTime(
                                    syncStatus?.lastSuccessUtc
                                )}
                            </Typography>
                        </Stack>

                        <Button
                            variant="outlined"
                            onClick={onOpenSync}
                        >
                            {t('dashboard.openSyncDiagnostics')}
                        </Button>
                    </Stack>
                </Box>

                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                        >
                            <Stack>
                                <Typography variant="subtitle1">
                                    {t('dashboard.recentAccessDecisions')}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {t('dashboard.recentAccessDecisionsSubtitle')}
                                </Typography>
                            </Stack>

                            <Button
                                size="small"
                                onClick={onOpenAttempts}
                            >
                                {t('dashboard.viewAllActivity')}
                            </Button>
                        </Stack>

                        {attemptsLoading ? (
                            <LoadingState
                                title={t('states.loadingAttempts')}
                            />
                        ) : attemptsError ? (
                            <ErrorState
                                title={t('states.failedToLoadAttempts')}
                            />
                        ) : attempts.length === 0 ? (
                            <EmptyState
                                title={t('dashboard.noAttemptsYet')}
                            />
                        ) : (
                            <Stack spacing={1.1}>
                                {attempts
                                    .slice(0, 5)
                                    .map((attempt) => (
                                        <RecentAttemptRow
                                            key={attempt.id}
                                            attempt={attempt}
                                        />
                                    ))}
                            </Stack>
                        )}
                    </Stack>
                </Box>
            </Box>
        </SectionCard>
    );
}