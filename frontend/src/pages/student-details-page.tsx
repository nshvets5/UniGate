import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
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
import { useParams } from 'react-router-dom';
import { useGroupsQuery } from '../features/groups/list-groups/use-groups-query';
import { CreateStudentCredentialDialog } from '../features/students/credentials/create-student-credential-dialog';
import { useToggleStudentCredentialActiveMutation } from '../features/students/credentials/use-toggle-student-credential-active-mutation';
import { useStudentCredentialsQuery } from '../features/students/student-details/use-student-credentials-query';
import { useStudentQuery } from '../features/students/student-details/use-student-query';
import { CodeBadge } from '../shared/ui/code-badge';
import { EmptyState } from '../shared/ui/empty-state';
import { EntityRow } from '../shared/ui/entity-row';
import { EntityTable, EntityTableHeaderCell } from '../shared/ui/entity-table';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { RowActions } from '../shared/ui/row-actions';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';
import ArrowBackOutlinedIcon from '@mui/icons-material/ArrowBackOutlined';
import { useNavigate } from 'react-router-dom';

export function StudentDetailsPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const { id = '' } = useParams();
    const [createCredentialOpen, setCreateCredentialOpen] = useState(false);

    const studentQuery = useStudentQuery(id);
    const credentialsQuery = useStudentCredentialsQuery(id);
    const groupsQuery = useGroupsQuery({ page: 1, pageSize: 100 });
    const toggleCredentialMutation = useToggleStudentCredentialActiveMutation(id);

    const groupMap = useMemo(() => {
        const map = new Map<string, { code: string; name: string }>();

        for (const group of groupsQuery.data?.items ?? []) {
            map.set(group.id, { code: group.code, name: group.name });
        }

        return map;
    }, [groupsQuery.data]);

    if (studentQuery.isLoading) {
        return (
            <PageContainer>
                <LoadingState
                    title="Loading student"
                    description="Please wait while the student profile is being loaded."
                />
            </PageContainer>
        );
    }

    if (studentQuery.isError || !studentQuery.data) {
        return (
            <PageContainer>
                <ErrorState
                    title="Failed to load student"
                    description="The student details could not be loaded from the server."
                    onRetry={() => void studentQuery.refetch()}
                />
            </PageContainer>
        );
    }

    const student = studentQuery.data;
    const group = groupMap.get(student.groupId);
    const fullName = [student.lastName, student.firstName, student.middleName]
        .filter(Boolean)
        .join(' ');

    const desktopColumns = 'minmax(220px, 1.7fr) 140px 140px 140px';

    return (
        <PageContainer>
            <PageHeader
                title={fullName}
                subtitle="Student profile, group assignment and access credentials."
                actions={
                    <Stack direction="row" spacing={1}>
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackOutlinedIcon />}
                            onClick={() => navigate('/admin/students')}
                        >
                            Back
                        </Button>

                        <Button
                            variant="contained"
                            startIcon={<AddOutlinedIcon />}
                            onClick={() => setCreateCredentialOpen(true)}
                        >
                            Add credential
                        </Button>
                    </Stack>
                }
            />

            <SectionCard>
                <Stack spacing={2}>
                    <Typography variant="subtitle1">Student overview</Typography>

                    <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={2}
                        useFlexGap
                        flexWrap="wrap"
                    >
                        <CodeBadge value={group?.code ?? 'UNKNOWN'} />
                        <StatusChip
                            label={student.isActive ? 'Active' : 'Inactive'}
                            variant={student.isActive ? 'success' : 'warning'}
                        />
                        {student.iamProfileId ? (
                            <StatusChip label="IAM linked" variant="info" />
                        ) : (
                            <StatusChip label="IAM not linked" variant="default" />
                        )}
                    </Stack>

                    <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            Email: {student.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Group: {group?.name ?? 'Unknown group'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Created: {new Date(student.createdAt).toLocaleString()}
                        </Typography>
                    </Stack>
                </Stack>
            </SectionCard>

            <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                <Stack spacing={0}>
                    <Box sx={{ p: 3 }}>
                        <Typography variant="subtitle1">Credentials</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Manage RFID, QR and manual credentials assigned to this student.
                        </Typography>
                    </Box>

                    <Divider />

                    {credentialsQuery.isLoading ? (
                        <LoadingState
                            title="Loading credentials"
                            description="Please wait while student credentials are being loaded."
                        />
                    ) : credentialsQuery.isError ? (
                        <ErrorState
                            title="Failed to load credentials"
                            description="The credentials list could not be loaded from the server."
                            onRetry={() => void credentialsQuery.refetch()}
                        />
                    ) : !credentialsQuery.data || credentialsQuery.data.length === 0 ? (
                        <EmptyState
                            title="No credentials found"
                            description="Add the first credential to enable access workflows for this student."
                            action={
                                <Button
                                    variant="contained"
                                    startIcon={<AddOutlinedIcon />}
                                    onClick={() => setCreateCredentialOpen(true)}
                                >
                                    Add first credential
                                </Button>
                            }
                        />
                    ) : (
                        <Stack spacing={0} sx={{ p: 2.25 }}>
                            <EntityTable
                                gridTemplateColumns={desktopColumns}
                                columns={
                                    <>
                                        <EntityTableHeaderCell>Value</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="center">Type</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="center">Status</EntityTableHeaderCell>
                                        <EntityTableHeaderCell align="right">Actions</EntityTableHeaderCell>
                                    </>
                                }
                            >
                                {credentialsQuery.data.map((credential) => {
                                    const isTogglingCurrent =
                                        toggleCredentialMutation.isPending &&
                                        toggleCredentialMutation.variables?.credentialId === credential.id;

                                    const accentColor = credential.isActive
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main;

                                    return (
                                        <EntityRow key={credential.id} accentColor={accentColor}>
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
                                                    <Typography variant="subtitle1" noWrap>
                                                        {credential.value}
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Created {new Date(credential.createdAt).toLocaleDateString()}
                                                    </Typography>
                                                </Stack>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: { xs: 'flex-start', md: 'center' },
                                                        minHeight: 40,
                                                    }}
                                                >
                                                    <CodeBadge value={credential.type.toUpperCase()} />
                                                </Box>

                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: { xs: 'flex-start', md: 'center' },
                                                        minHeight: 40,
                                                    }}
                                                >
                                                    <StatusChip
                                                        label={credential.isActive ? 'Active' : 'Inactive'}
                                                        variant={credential.isActive ? 'success' : 'warning'}
                                                    />
                                                </Box>

                                                <Stack
                                                    direction="row"
                                                    spacing={0.5}
                                                    justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                                    alignItems="center"
                                                >
                                                    <RowActions>
                                                        <Tooltip
                                                            title={
                                                                credential.isActive
                                                                    ? 'Deactivate credential'
                                                                    : 'Activate credential'
                                                            }
                                                        >
                              <span>
                                <IconButton
                                    onClick={() =>
                                        void toggleCredentialMutation.mutateAsync({
                                            credentialId: credential.id,
                                            isActive: !credential.isActive,
                                        })
                                    }
                                    disabled={isTogglingCurrent}
                                >
                                  {isTogglingCurrent ? (
                                      <CircularProgress size={18} />
                                  ) : credential.isActive ? (
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

            <CreateStudentCredentialDialog
                open={createCredentialOpen}
                studentId={student.id}
                onClose={() => setCreateCredentialOpen(false)}
            />
        </PageContainer>
    );
}