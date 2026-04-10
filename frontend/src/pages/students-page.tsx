import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import {
    Box,
    Button,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGroupsQuery } from '../features/groups/list-groups/use-groups-query';
import { CreateStudentDialog } from '../features/students/create-student/create-student-dialog';
import { useStudentsQuery } from '../features/students/list-students/use-students-query';
import { CodeBadge } from '../shared/ui/code-badge';
import { EmptyState } from '../shared/ui/empty-state';
import { EntityRow } from '../shared/ui/entity-row';
import { EntityTable, EntityTableHeaderCell } from '../shared/ui/entity-table';
import { EntityToolbar } from '../shared/ui/entity-toolbar';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

export function StudentsPage() {
    const { t } = useTranslation();
    const theme = useTheme();
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);

    const studentQueryParams = useMemo(
        () => ({
            search: search || undefined,
            page: 1,
            pageSize: 20,
        }),
        [search]
    );

    const studentsQuery = useStudentsQuery(studentQueryParams);
    const groupsQuery = useGroupsQuery({
        page: 1,
        pageSize: 100,
    });

    const groupMap = useMemo(() => {
        const map = new Map<string, { code: string; name: string }>();

        for (const group of groupsQuery.data?.items ?? []) {
            map.set(group.id, {
                code: group.code,
                name: group.name,
            });
        }

        return map;
    }, [groupsQuery.data]);

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
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                    disabled={groupsQuery.isLoading || groupsQuery.isError}
                                >
                                    Create student
                                </Button>
                            }
                        />
                    </Stack>

                    <Divider />

                    {studentsQuery.isLoading ? (
                        <LoadingState
                            title="Loading students"
                            description="Please wait while student records are being loaded."
                        />
                    ) : studentsQuery.isError ? (
                        <ErrorState
                            title="Failed to load students"
                            description="The students list could not be loaded from the server."
                            onRetry={() => void studentsQuery.refetch()}
                        />
                    ) : !studentsQuery.data || studentsQuery.data.items.length === 0 ? (
                        <EmptyState
                            title="No students found"
                            description="Create the first student record to start managing the directory."
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateOpen(true)}
                                    disabled={groupsQuery.isLoading || groupsQuery.isError}
                                >
                                    Create first student
                                </Button>
                            }
                        />
                    ) : (
                        <Stack spacing={0} sx={{ p: 2.25 }}>
                            <Box
                                sx={{
                                    px: 1,
                                    pb: 2,
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 2,
                                    flexWrap: 'wrap',
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Total records: {studentsQuery.data.totalCount}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Authorized student directory view
                                </Typography>
                            </Box>

                            <EntityTable
                                columns={
                                    <>
                                        <EntityTableHeaderCell>Student</EntityTableHeaderCell>
                                        <EntityTableHeaderCell>Group</EntityTableHeaderCell>
                                        <EntityTableHeaderCell>Status</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="right">
                                            Email
                                        </EntityTableHeaderCell>
                                    </>
                                }
                            >
                                {studentsQuery.data.items.map((student) => {
                                    const group = groupMap.get(student.groupId);

                                    const fullName = [
                                        student.lastName,
                                        student.firstName,
                                        student.middleName,
                                    ]
                                        .filter(Boolean)
                                        .join(' ');

                                    const accentColor = student.isActive
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main;

                                    return (
                                        <EntityRow key={student.id} accentColor={accentColor}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: {
                                                        xs: '1fr',
                                                        md: 'minmax(280px, 2fr) 180px 140px 240px',
                                                    },
                                                    alignItems: 'center',
                                                    columnGap: 2,
                                                    rowGap: 1.5,
                                                    pl: { xs: 0, md: 1.25 },
                                                }}
                                            >
                                                <Stack spacing={0.45} minWidth={0}>
                                                    <Typography variant="subtitle1" noWrap>
                                                        {fullName}
                                                    </Typography>

                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                        flexWrap="wrap"
                                                        useFlexGap
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            Created {new Date(student.createdAt).toLocaleDateString()}
                                                        </Typography>

                                                        {student.iamProfileId ? (
                                                            <>
                                                                <Box
                                                                    sx={{
                                                                        width: 4,
                                                                        height: 4,
                                                                        borderRadius: '50%',
                                                                        bgcolor: alpha(theme.palette.text.secondary, 0.5),
                                                                    }}
                                                                />
                                                                <Typography variant="body2" color="text.secondary">
                                                                    IAM linked
                                                                </Typography>
                                                            </>
                                                        ) : null}
                                                    </Stack>
                                                </Stack>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: { xs: 'flex-start', md: 'flex-start' },
                                                        gap: 1,
                                                        flexWrap: 'wrap',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: { xs: 'inline', md: 'none' }, mr: 0.75 }}
                                                    >
                                                        Group:
                                                    </Typography>

                                                    {group ? (
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <CodeBadge value={group.code} />
                                                        </Stack>
                                                    ) : (
                                                        <Typography variant="body2" color="text.secondary">
                                                            Unknown group
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: { xs: 'flex-start', md: 'flex-start' },
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        color="text.secondary"
                                                        sx={{ display: { xs: 'inline', md: 'none' }, mr: 0.75 }}
                                                    >
                                                        Status:
                                                    </Typography>
                                                    <StatusChip
                                                        label={student.isActive ? 'Active' : 'Inactive'}
                                                        variant={student.isActive ? 'success' : 'warning'}
                                                    />
                                                </Box>

                                                <Stack
                                                    justifyContent={{ xs: 'flex-start', md: 'center' }}
                                                    alignItems={{ xs: 'flex-start', md: 'flex-end' }}
                                                    minWidth={0}
                                                >
                                                    <Typography variant="body2" noWrap>
                                                        {student.email}
                                                    </Typography>
                                                </Stack>
                                            </Box>
                                        </EntityRow>
                                    );
                                })}
                            </EntityTable>
                        </Stack>
                    )}
                </Stack>
            </SectionCard>

            <CreateStudentDialog
                open={createOpen}
                onClose={() => setCreateOpen(false)}
                groups={groupsQuery.data?.items ?? []}
            />
        </PageContainer>
    );
}