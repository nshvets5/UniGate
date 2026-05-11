import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import {
    Box,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ReaderStatusDto } from '../../entities/reader/api';
import { CodeBadge } from '../../shared/ui/code-badge';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    status: ReaderStatusDto;
};

function formatDateTime(value?: string | null) {
    if (!value) return '—';
    return new Date(value).toLocaleString();
}

export function ReaderDiagnosticsPanel({ status }: Props) {
    const theme = useTheme();

    const diagnostics = [
        {
            label: 'Device identity',
            value: status.id,
            icon: <DnsOutlinedIcon />,
        },
        {
            label: 'API key',
            value: status.hasApiKey ? 'Configured' : 'Missing',
            icon: <KeyOutlinedIcon />,
        },
        {
            label: 'Created at',
            value: formatDateTime(status.createdAt),
            icon: <ScheduleOutlinedIcon />,
        },
        {
            label: 'Server time',
            value: formatDateTime(status.utcNow),
            icon: <SensorsOutlinedIcon />,
        },
    ];

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
                <Stack spacing={0.75}>
                    <Typography variant="subtitle1">Reader diagnostics</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Runtime metadata and operational health of the selected reader device.
                    </Typography>
                </Stack>
            </Box>

            <Divider />

            <Stack spacing={0} divider={<Divider />}>
                {diagnostics.map((item) => (
                    <Box
                        key={item.label}
                        sx={{
                            p: 2.5,
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                md: '42px 180px minmax(0, 1fr)',
                            },
                            gap: 1.5,
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                width: 38,
                                height: 38,
                                borderRadius: 2.5,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                            }}
                        >
                            {item.icon}
                        </Box>

                        <Typography variant="body2" color="text.secondary">
                            {item.label}
                        </Typography>

                        {item.label === 'API key' ? (
                            <StatusChip
                                label={item.value}
                                variant={status.hasApiKey ? 'success' : 'warning'}
                            />
                        ) : item.label === 'Device identity' ? (
                            <CodeBadge value={item.value} />
                        ) : (
                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                {item.value}
                            </Typography>
                        )}
                    </Box>
                ))}
            </Stack>
        </SectionCard>
    );
}