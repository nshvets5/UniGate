import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Button, Divider, Stack } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { EntityToolbar } from '../shared/ui/entity-toolbar';
import { EmptyState } from '../shared/ui/empty-state';

export function StudentsPage() {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    return (
        <PageContainer>
            <PageHeader
                title={t('pages.students.title')}
                subtitle="Manage students, IAM bindings and access credentials."
            />

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Stack spacing={0}>
                    <Stack sx={{ p: 3 }}>
                        <EntityToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Search students by name or email..."
                            primaryAction={
                                <Button variant="contained" startIcon={<AddOutlinedIcon />}>
                                    Create student
                                </Button>
                            }
                        />
                    </Stack>

                    <Divider />

                    <EmptyState
                        title="No students yet"
                        description="When student records are added, this page will show searchable and filterable directory data."
                        action={
                            <Button variant="contained" startIcon={<AddOutlinedIcon />}>
                                Create first student
                            </Button>
                        }
                    />
                </Stack>
            </SectionCard>
        </PageContainer>
    );
}