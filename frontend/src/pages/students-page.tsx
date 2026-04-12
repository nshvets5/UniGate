import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import type { GroupDto } from '../entities/group/types';
import type { StudentDto } from '../entities/student/types';
import { useGroupsQuery } from '../features/groups/list-groups/use-groups-query';
import { CreateStudentDialog } from '../features/students/create-student/create-student-dialog';
import { ChangeStudentGroupDialog } from '../features/students/change-student-group/change-student-group-dialog';
import { useStudentsQuery } from '../features/students/list-students/use-students-query';
import { useToggleStudentActiveMutation } from '../features/students/toggle-student-active/use-toggle-student-active-mutation';
import { UpdateStudentDialog } from '../features/students/update-student/update-student-dialog';
import { CodeBadge } from '../shared/ui/code-badge';
import { EmptyState } from '../shared/ui/empty-state';
import { EntityRow } from '../shared/ui/entity-row';
import { EntityTable, EntityTableHeaderCell } from '../shared/ui/entity-table';
import { EntityToolbar } from '../shared/ui/entity-toolbar';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { RowActions } from '../shared/ui/row-actions';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

export function StudentsPage() {
    const { t } = useTranslation();
    const theme = useTheme();
    const navigate = useNavigate();

    const desktopColumns = 'minmax(280px, 2fr) 180px 140px 180px';
    const [search, setSearch] = useState('');
    const [createOpen, setCreateOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState<StudentDto | null>(null);
    const [groupChangingStudent, setGroupChangingStudent] = useState<StudentDto | null>(null);

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
    const toggleMutation = useToggleStudentActiveMutation();

    const groupMap = useMemo(() => {
        const map = new Map<string, GroupDto>();

        for (const group of groupsQuery.data?.items ?? []) {
            map.set(group.id, group);
        }

        return map;
    }, [groupsQuery.data]);

    const handleToggleActive = async (student: StudentDto) => {
        await toggleMutation.mutateAsync({
            id: student.id,
            isActive: !student.isActive,
        });
    };

    const handleOpenDetails = (studentId: string) => {
        navigate(`/admin/students/${studentId}`);
    };

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
                            </Box>

                            <EntityTable
                                gridTemplateColumns={desktopColumns}
                                columns={
                                    <>
                                        <EntityTableHeaderCell>Student</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="center">Group</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="center">Status</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="right">
                                            Actions
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

                                    const isTogglingCurrent =
                                        toggleMutation.isPending &&
                                        toggleMutation.variables?.id === student.id;

                                    return (
                                        <EntityRow key={student.id} accentColor={accentColor}>
                                            <Box
                                                sx={{
                                                    display: 'grid',
                                                    gridTemplateColumns: {
                                                        xs: '1fr',
                                                        md: desktopColumns,
                                                    },
                                                    alignItems: 'center',
                                                    columnGap: 2,
                                                    rowGap: 1.5,
                                                    pl: { xs: 0, md: 1.25 },
                                                }}
                                            >
                                                <Stack spacing={0.45} minWidth={0}>
                                                    <Box
                                                        component="button"
                                                        type="button"
                                                        onClick={() => handleOpenDetails(student.id)}
                                                        sx={{
                                                            all: 'unset',
                                                            cursor: 'pointer',
                                                            display: 'inline-block',
                                                            maxWidth: '100%',
                                                        }}
                                                    >
                                                        <Typography
                                                            variant="subtitle1"
                                                            noWrap
                                                            sx={{
                                                                color: 'text.primary',
                                                                transition: 'color 0.18s ease',
                                                                '&:hover': {
                                                                    color: 'primary.main',
                                                                },
                                                            }}
                                                        >
                                                            {fullName}
                                                        </Typography>
                                                    </Box>

                                                    <Stack
                                                        direction="row"
                                                        spacing={1}
                                                        alignItems="center"
                                                        flexWrap="wrap"
                                                        useFlexGap
                                                    >
                                                        <Typography variant="body2" color="text.secondary">
                                                            {student.email}
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
                                                        justifyContent: { xs: 'flex-start', md: 'center' },
                                                        gap: 1,
                                                        flexWrap: 'wrap',
                                                        minHeight: 40,
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
                                                        <CodeBadge value={group.code} />
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
                                                        justifyContent: { xs: 'flex-start', md: 'center' },
                                                        minHeight: 40,
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
                                                    direction="row"
                                                    spacing={0.5}
                                                    justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                                    alignItems="center"
                                                >
                                                    <RowActions>
                                                        <Tooltip title="Edit student">
                                                            <IconButton onClick={() => setEditingStudent(student)}>
                                                                <EditOutlinedIcon />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip title="Change student group">
                                                            <IconButton
                                                                onClick={() => setGroupChangingStudent(student)}
                                                                disabled={groupsQuery.isLoading || groupsQuery.isError}
                                                            >
                                                                <SwapHorizOutlinedIcon />
                                                            </IconButton>
                                                        </Tooltip>

                                                        <Tooltip
                                                            title={
                                                                student.isActive
                                                                    ? 'Deactivate student'
                                                                    : 'Activate student'
                                                            }
                                                        >
                              <span>
                                <IconButton
                                    onClick={() => void handleToggleActive(student)}
                                    disabled={isTogglingCurrent}
                                >
                                  {isTogglingCurrent ? (
                                      <CircularProgress size={18} />
                                  ) : student.isActive ? (
                                      <PauseCircleOutlineOutlinedIcon />
                                  ) : (
                                      <PlayCircleOutlineOutlinedIcon />
                                  )}
                                </IconButton>
                              </span>
                                                        </Tooltip>
                                                    </RowActions>
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

            <UpdateStudentDialog
                open={Boolean(editingStudent)}
                student={editingStudent}
                onClose={() => setEditingStudent(null)}
            />

            <ChangeStudentGroupDialog
                open={Boolean(groupChangingStudent)}
                student={groupChangingStudent}
                groups={groupsQuery.data?.items ?? []}
                onClose={() => setGroupChangingStudent(null)}
            />
        </PageContainer>
    );
}