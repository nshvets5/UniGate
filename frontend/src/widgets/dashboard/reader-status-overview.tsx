import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import { Button, Divider, Stack } from '@mui/material';
import { SectionCard } from '../../shared/ui/section-card';
import {
    DashboardDonutChart,
    DashboardLegendRow,
    DashboardWidgetHeader,
} from './dashboard-ui';
import { useTranslation } from 'react-i18next';

type Props = {
    total: number;
    online: number;
    offline: number;
    active: number;
    onOpen: () => void;
};

export function ReaderStatusOverview({
                                         total,
                                         online,
                                         offline,
                                         active,
                                         onOpen,
                                     }: Props) {
    const onlinePercent = total > 0 ? Math.round((online / total) * 100) : 0;
    const { t } = useTranslation();

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <DashboardWidgetHeader
                icon={<DevicesOutlinedIcon />}
                title={t('dashboard.readerStatus')}
                subtitle={t('dashboard.readerStatusSubtitle')}
            />

            <Divider />

            <Stack spacing={2.5} sx={{ p: 3 }} alignItems="center">
                <DashboardDonutChart
                    value={onlinePercent}
                    label={String(total)}
                    subtitle={t('readers.title')}
                />

                <Stack spacing={1.2} sx={{ width: '100%' }}>
                    <DashboardLegendRow
                        label={t('dashboard.online')}
                        value={online}
                        tone="success"
                    />

                    <DashboardLegendRow
                        label={t('dashboard.offline')}
                        value={offline}
                        tone="warning"
                    />

                    <DashboardLegendRow
                        label={t('common.active')}
                        value={active}
                        tone="info"
                    />
                </Stack>

                <Button fullWidth variant="outlined" onClick={onOpen}>
                    {t('dashboard.viewAllReaders')}
                </Button>
            </Stack>
        </SectionCard>
    );
}