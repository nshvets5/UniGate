import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { Button, Divider, Stack, Typography } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { EntityToolbar } from '../shared/ui/entity-toolbar';
import { EmptyState } from '../shared/ui/empty-state';

export function GroupsPage() {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');

    return (
        <PageContainer>
            <PageHeader
                title={t('pages.groups.title')}
                subtitle="Manage academic groups, lifecycle state and directory metadata."
            />

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Stack spacing={0}>
                    <Stack sx={{ p: 3 }}>
                        <EntityToolbar
                            searchValue={search}
                            onSearchChange={setSearch}
                            searchPlaceholder="Search groups by code or name..."
                            primaryAction={
                                <Button variant="contained" startIcon={<AddOutlinedIcon />}>
                                    Create group
                                </Button>
                            }
                        />
                    </Stack>

                    <Divider />

                    <EmptyState
                        title="No groups yet"
                        description="When you create the first academic group, it will appear here with filters, actions and lifecycle status."
                        action={
                            <Button variant="contained" startIcon={<AddOutlinedIcon />}>
                                Create first group
                            </Button>
                        }
                    />
                </Stack>
            </SectionCard>
        </PageContainer>
    );
}