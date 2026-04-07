import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
import DoorFrontOutlinedIcon from '@mui/icons-material/DoorFrontOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import { Grid, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';

const kpis = [
    {
        label: 'Groups',
        value: '—',
        icon: <ApartmentOutlinedIcon />,
    },
    {
        label: 'Students',
        value: '—',
        icon: <BadgeOutlinedIcon />,
    },
    {
        label: 'Doors',
        value: '—',
        icon: <DoorFrontOutlinedIcon />,
    },
    {
        label: 'Readers',
        value: '—',
        icon: <SensorsOutlinedIcon />,
    },
];

export function DashboardPage() {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <PageContainer>
            <PageHeader
                title={t('pages.dashboard.title')}
                subtitle="Overview of the access control platform and administrative modules."
            />

            <Grid container spacing={3}>
                {kpis.map((item) => (
                    <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                        <SectionCard>
                            <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                <Stack spacing={1}>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.label}
                                    </Typography>
                                    <Typography variant="h5">{item.value}</Typography>
                                </Stack>

                                <Stack
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 3,
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: 'primary.main',
                                    }}
                                >
                                    {item.icon}
                                </Stack>
                            </Stack>
                        </SectionCard>
                    </Grid>
                ))}

                <Grid size={{ xs: 12 }}>
                    <SectionCard>
                        <Typography variant="subtitle1">System Overview</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            This dashboard will display aggregated operational metrics, reader activity,
                            access statistics and monitoring widgets after the corresponding modules are connected.
                        </Typography>
                    </SectionCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
}