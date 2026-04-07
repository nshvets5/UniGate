import { Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';

export function StudentsPage() {
    const { t } = useTranslation();

    return (
        <PageContainer>
            <PageHeader
                title={t('pages.students.title')}
                subtitle="Manage students, bindings and access credentials."
            />

            <SectionCard>
                <Typography variant="body1">Students module will be implemented in the next step.</Typography>
            </SectionCard>
        </PageContainer>
    );
}