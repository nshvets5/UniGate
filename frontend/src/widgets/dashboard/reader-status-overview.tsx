import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import { Button, Divider, Stack } from '@mui/material';
import { SectionCard } from '../../shared/ui/section-card';
import {
    DashboardDonutChart,
    DashboardLegendRow,
    DashboardWidgetHeader,
} from './dashboard-ui';

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

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <DashboardWidgetHeader
                icon={<DevicesOutlinedIcon />}
                title="Reader status overview"
                subtitle="Real-time status of reader devices."
            />

            <Divider />

            <Stack spacing={2.5} sx={{ p: 3 }} alignItems="center">
                <DashboardDonutChart
                    value={onlinePercent}
                    label={String(total)}
                    subtitle="Total readers"
                />

                <Stack spacing={1.2} sx={{ width: '100%' }}>
                    <DashboardLegendRow label="Online" value={online} tone="success" />
                    <DashboardLegendRow label="Offline" value={offline} tone="warning" />
                    <DashboardLegendRow label="Active" value={active} tone="info" />
                </Stack>

                <Button fullWidth variant="outlined" onClick={onOpen}>
                    View all readers
                </Button>
            </Stack>
        </SectionCard>
    );
}