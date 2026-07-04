import { useTranslation } from 'react-i18next';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import { Box, Button, Divider, Stack } from '@mui/material';
import { SectionCard } from '../../shared/ui/section-card';
import {
    DashboardHealthRow,
    DashboardWidgetHeader,
} from './dashboard-ui';

type Props = {
    readersOffline: number;
    syncHealthy: boolean;
    syncLoading: boolean;
    attemptsHealthy: boolean;
    onOpen: () => void;
};

export function DashboardSystemHealthWidget({
                                                readersOffline,
                                                syncHealthy,
                                                syncLoading,
                                                attemptsHealthy,
                                                onOpen,
                                            }: Props) {
    const { t } = useTranslation();

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <DashboardWidgetHeader
                icon={<CheckCircleOutlineOutlinedIcon />}
                title={t('dashboard.systemHealth')}
                subtitle={t('dashboard.systemHealthSubtitle')}
            />

            <Divider />

            <Stack spacing={0} divider={<Divider />}>
                <DashboardHealthRow
                    label={t('dashboard.accessService')}
                    healthy
                />

                <DashboardHealthRow
                    label={t('dashboard.readerConnection')}
                    healthy={readersOffline === 0}
                />

                <DashboardHealthRow
                    label={t('dashboard.timetableSync')}
                    healthy={syncHealthy}
                    loading={syncLoading}
                />

                <DashboardHealthRow
                    label={t('dashboard.attemptsApi')}
                    healthy={attemptsHealthy}
                />
            </Stack>

            <Box sx={{ p: 2.5 }}>
                <Button fullWidth variant="outlined" onClick={onOpen}>
                    {t('dashboard.viewMonitoring')}
                </Button>
            </Box>
        </SectionCard>
    );
}