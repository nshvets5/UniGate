import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';

export function GroupsPage() {
    const { t } = useTranslation();

    return (
        <PageContainer>
            <PageHeader
                title={t('pages.groups.title')}
                subtitle="Manage academic groups and directory entities."
            />

            <SectionCard>
                <Typography variant="body1">Groups module will be implemented in the next step.</Typography>
            </SectionCard>
        </PageContainer>
    );
}