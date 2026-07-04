import AssignmentTurnedInOutlinedIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import { Box, Divider, Stack, Typography } from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../../shared/ui/empty-state';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { SectionCard } from '../../shared/ui/section-card';
import {
    DashboardIconBubble,
    DashboardWidgetHeader,
    type DashboardTone,
} from './dashboard-ui';

type AuditEventLike = {
    id: string;
    type: string;
    resourceType?: string | null;
    actorSubject?: string | null;
    actorProvider?: string | null;
    occurredAt: string;
};

type Props = {
    events: AuditEventLike[];
    isLoading: boolean;
    isError: boolean;
    onRetry: () => void;
    onOpen: () => void;
};

export function RecentActivityWidget({
                                         events,
                                         isLoading,
                                         isError,
                                         onRetry,
                                         onOpen,
                                     }: Props) {
    const { t } = useTranslation();

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <DashboardWidgetHeader
                icon={<HistoryOutlinedIcon />}
                title={t('dashboard.recentActivity')}
                subtitle={t('dashboard.recentActivitySubtitle')}
                actionLabel={t('dashboard.viewAllActivity')}
                onAction={onOpen}
            />

            <Divider />

            {isLoading ? (
                <LoadingState
                    title={t('states.loadingActivity')}
                />
            ) : isError ? (
                <ErrorState
                    title={t('states.failedToLoadActivity')}
                    onRetry={onRetry}
                />
            ) : events.length === 0 ? (
                <EmptyState
                    title={t('dashboard.noRecentActivity')}
                    description={t('dashboard.recentActivitySubtitle')}
                />
            ) : (
                <Stack divider={<Divider />}>
                    {events.map((event) => (
                        <ActivityRow key={event.id} event={event} />
                    ))}
                </Stack>
            )}
        </SectionCard>
    );
}

function ActivityRow({ event }: { event: AuditEventLike }) {
    const variant = getActivityVariant(event.type);
    const { t } = useTranslation();

    return (
        <Box sx={{ px: 2.5, py: 1.8 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <DashboardIconBubble tone={variant} compact>
                    {variant === 'error' ? (
                        <WarningAmberOutlinedIcon />
                    ) : (
                        <AssignmentTurnedInOutlinedIcon />
                    )}
                </DashboardIconBubble>

                <Stack minWidth={0} flex={1}>
                    <Typography variant="subtitle2" noWrap>
                        {event.type}
                    </Typography>

                    <Typography variant="body2" color="text.secondary" noWrap>
                        {event.resourceType ?? t('common.system')} ·
                        {event.actorSubject || event.actorProvider || t('common.system')}
                    </Typography>
                </Stack>

                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ whiteSpace: 'nowrap' }}
                >
                    {formatDateTime(event.occurredAt)}
                </Typography>
            </Stack>
        </Box>
    );
}

function getActivityVariant(type: string): DashboardTone {
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

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}