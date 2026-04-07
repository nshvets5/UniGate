import { Grid, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';

export function DashboardPage() {
    const { t } = useTranslation();

    return (
        <PageContainer>
            <PageHeader
                title={t('pages.dashboard.title')}
                subtitle="Overview of the access control platform and operational modules."
            />

            <Grid container spacing={3}>
                <Grid size={{ xs: 12, md: 4 }}>
                    <SectionCard>
                        <Typography variant="subtitle1">Directory</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Students, groups and educational structure management.
                        </Typography>
                    </SectionCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <SectionCard>
                        <Typography variant="subtitle1">Access Control</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Doors, zones, rules and access decision logic.
                        </Typography>
                    </SectionCard>
                </Grid>

                <Grid size={{ xs: 12, md: 4 }}>
                    <SectionCard>
                        <Typography variant="subtitle1">Monitoring</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            Audit events, readers, attempts and timetable synchronization.
                        </Typography>
                    </SectionCard>
                </Grid>
            </Grid>
        </PageContainer>
    );
}