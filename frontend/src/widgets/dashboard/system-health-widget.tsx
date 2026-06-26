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
    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <DashboardWidgetHeader
                icon={<CheckCircleOutlineOutlinedIcon />}
                title="System health"
                subtitle="Core service status."
            />

            <Divider />

            <Stack spacing={0} divider={<Divider />}>
                <DashboardHealthRow label="Access service" healthy />
                <DashboardHealthRow
                    label="Reader connection"
                    healthy={readersOffline === 0}
                />
                <DashboardHealthRow
                    label="Timetable sync"
                    healthy={syncHealthy}
                    loading={syncLoading}
                />
                <DashboardHealthRow
                    label="Attempts API"
                    healthy={attemptsHealthy}
                />
            </Stack>

            <Box sx={{ p: 2.5 }}>
                <Button fullWidth variant="outlined" onClick={onOpen}>
                    View monitoring
                </Button>
            </Box>
        </SectionCard>
    );
}