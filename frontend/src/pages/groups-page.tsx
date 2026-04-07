import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {
    Box,
    Button,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EmptyState } from '../shared/ui/empty-state';
import { EntityToolbar } from '../shared/ui/entity-toolbar';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';
import { CreateGroupDialog } from '../features/groups/create-group/create-group-dialog';

type MockGroup = {
    id: string;
    code: string;
    name: string;
    admissionYear: number;
    isActive: boolean;
    createdAt: string;
};

const initialGroups: MockGroup[] = [
    {
        id: '1',
        code: 'PZPI-22-5',
        name: 'ПЗПІ-22-5',
        admissionYear: 2022,
        isActive: true,
        createdAt: '2026-04-01T10:00:00Z',
    },
    {
        id: '2',
        code: 'PZPI-23-1',
        name: 'ПЗПІ-23-1',
        admissionYear: 2023,
        isActive: true,
        createdAt: '2026-04-01T10:00:00Z',
    },
    {
        id: '3',
        code: 'KN-21-2',
        name: 'КН-21-2',
        admissionYear: 2021,
        isActive: false,
        createdAt: '2026-04-01T10:00:00Z',
    },
];

export function GroupsPage() {
    const { t } = useTranslation();
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [groups, setGroups] = useState<MockGroup[]>(initialGroups);

    const filteredGroups = useMemo(() => {
        const normalized = search.trim().toLowerCase();

        if (!normalized) return groups;

        return groups.filter(
            (group) =>
                group.code.toLowerCase().includes(normalized) ||
                group.name.toLowerCase().includes(normalized)
        );
    }, [groups, search]);

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
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create group
                                </Button>
                            }
                        />
                    </Stack>

                    <Divider />

                    {filteredGroups.length === 0 ? (
                        <EmptyState
                            title="No groups found"
                            description="No groups match the current search criteria. Try a different query or create a new academic group."
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                >
                                    Create group
                                </Button>
                            }
                        />
                    ) : (
                        <Stack spacing={0}>
                            <Box sx={{ px: 3, py: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Total records: {filteredGroups.length}
                                </Typography>
                            </Box>

                            <Divider />

                            <Stack divider={<Divider />}>
                                {filteredGroups.map((group) => (
                                    <Box
                                        key={group.id}
                                        sx={{
                                            px: 3,
                                            py: 2.25,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 2,
                                            flexWrap: 'wrap',
                                        }}
                                    >
                                        <Stack spacing={0.5}>
                                            <Typography variant="subtitle1">{group.name}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {group.code} · Admission year: {group.admissionYear}
                                            </Typography>
                                        </Stack>

                                        <StatusChip
                                            label={group.isActive ? 'Active' : 'Inactive'}
                                            variant={group.isActive ? 'success' : 'warning'}
                                        />
                                    </Box>
                                ))}
                            </Stack>
                        </Stack>
                    )}
                </Stack>
            </SectionCard>

            <CreateGroupDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                onCreate={(payload) => {
                    const newGroup: MockGroup = {
                        id: crypto.randomUUID(),
                        code: payload.code,
                        name: payload.name,
                        admissionYear: payload.admissionYear,
                        isActive: true,
                        createdAt: new Date().toISOString(),
                    };

                    setGroups((prev) => [newGroup, ...prev]);
                    setCreateOpen(false);
                }}
            />
        </PageContainer>
    );
}