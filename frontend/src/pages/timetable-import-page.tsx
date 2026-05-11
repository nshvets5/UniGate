import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DoneAllOutlinedIcon from '@mui/icons-material/DoneAllOutlined';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { TimetablePreviewResponseDto } from '../entities/timetable/api';
import { useApplyTimetablePreviewMutation } from '../features/timetable/apply-preview/use-apply-timetable-preview-mutation';
import { usePreviewTimetableCsvMutation } from '../features/timetable/import-csv/use-preview-timetable-csv-mutation';
import { usePreviewTimetableIcsMutation } from '../features/timetable/import-ics/use-preview-timetable-ics-mutation';
import { EmptyState } from '../shared/ui/empty-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';
import { TimetablePreviewDiffViewer } from '../widgets/timetable/timetable-preview-diff-viewer';

type ImportFormat = 'csv' | 'ics';

export function TimetableImportPage() {
    const theme = useTheme();
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    const [format, setFormat] = useState<ImportFormat>('csv');
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<TimetablePreviewResponseDto | null>(null);
    const [applyResultVisible, setApplyResultVisible] = useState(false);

    const csvPreviewMutation = usePreviewTimetableCsvMutation();
    const icsPreviewMutation = usePreviewTimetableIcsMutation();
    const applyMutation = useApplyTimetablePreviewMutation();

    const isPreviewPending =
        csvPreviewMutation.isPending || icsPreviewMutation.isPending;

    const isPreviewError =
        csvPreviewMutation.isError || icsPreviewMutation.isError;

    const handleFormatChange = (_: unknown, value: ImportFormat | null) => {
        if (!value) return;

        setFormat(value);
        setSelectedFile(null);
        setPreview(null);
        setApplyResultVisible(false);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }

        csvPreviewMutation.reset();
        icsPreviewMutation.reset();
    };

    const handleFileChange = async (file: File | null) => {
        setSelectedFile(file);
        setPreview(null);
        setApplyResultVisible(false);

        csvPreviewMutation.reset();
        icsPreviewMutation.reset();

        if (!file) return;

        const result =
            format === 'csv'
                ? await csvPreviewMutation.mutateAsync(file)
                : await icsPreviewMutation.mutateAsync(file);

        setPreview(result);
    };

    const handleApply = async () => {
        if (!preview) return;

        await applyMutation.mutateAsync({
            previewToken: preview.previewToken,
        });

        setApplyResultVisible(true);
    };

    const report = preview?.report;

    return (
        <PageContainer>
            <PageHeader
                title="Timetable import"
                subtitle="Upload CSV or ICS files, preview validation results and apply timetable snapshots."
                actions={
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin/timetable/batches')}
                        >
                            Batches history
                        </Button>

                        <Button
                            variant="outlined"
                            onClick={() => navigate('/admin/timetable/sync')}
                        >
                            Sync status
                        </Button>
                    </Stack>
                }
            />

            {applyResultVisible ? (
                <Alert severity="success" onClose={() => setApplyResultVisible(false)}>
                    Timetable preview has been applied successfully. The batches history was updated.
                </Alert>
            ) : null}

            <SectionCard>
                <Stack spacing={2.5}>
                    <Stack spacing={0.75}>
                        <Typography variant="subtitle1">Import format</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Select the timetable file format before uploading a file for preview.
                        </Typography>
                    </Stack>

                    <ToggleButtonGroup
                        exclusive
                        value={format}
                        onChange={handleFormatChange}
                        size="small"
                    >
                        <ToggleButton value="csv">CSV</ToggleButton>
                        <ToggleButton value="ics">ICS</ToggleButton>
                    </ToggleButtonGroup>

                    <Divider />

                    <Stack spacing={0.75}>
                        <Typography variant="subtitle1">
                            {format.toUpperCase()} file
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            The system will validate the selected file and show a preview before applying changes.
                        </Typography>
                    </Stack>

                    <Box
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                            p: 4,
                            borderRadius: 3,
                            border: '1px dashed',
                            borderColor: isPreviewError
                                ? 'error.main'
                                : alpha(theme.palette.primary.main, 0.45),
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                            display: 'grid',
                            placeItems: 'center',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.18s ease',
                            '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.07),
                                borderColor: 'primary.main',
                            },
                        }}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={format === 'csv' ? '.csv,text/csv' : '.ics,text/calendar'}
                            hidden
                            onChange={(event) => {
                                const file = event.target.files?.[0] ?? null;
                                void handleFileChange(file);
                            }}
                        />

                        <Stack spacing={1.5} alignItems="center">
                            <Box
                                sx={{
                                    width: 58,
                                    height: 58,
                                    borderRadius: 4,
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    color: 'primary.main',
                                }}
                            >
                                {isPreviewPending ? (
                                    <CircularProgress size={26} />
                                ) : (
                                    <CloudUploadOutlinedIcon />
                                )}
                            </Box>

                            <Typography variant="h6">
                                {selectedFile
                                    ? selectedFile.name
                                    : `Choose ${format.toUpperCase()} file`}
                            </Typography>

                            <Typography variant="body2" color="text.secondary">
                                Click here to select a timetable file for preview.
                            </Typography>
                        </Stack>
                    </Box>

                    {isPreviewError ? (
                        <Alert severity="error">
                            Failed to generate preview. Please check the file format and try again.
                        </Alert>
                    ) : null}
                </Stack>
            </SectionCard>

            {!preview ? (
                <EmptyState
                    title="No preview yet"
                    description="Upload a timetable file to see import statistics, validation issues and semantic changes."
                />
            ) : (
                <>
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
                            gap: 2,
                        }}
                    >
                        {[
                            ['Total rows', report?.totalRows ?? 0],
                            ['Imported rows', report?.importedRows ?? 0],
                            ['Skipped rows', report?.skippedRows ?? 0],
                        ].map(([label, value]) => (
                            <SectionCard key={label}>
                                <Typography variant="body2" color="text.secondary">
                                    {label}
                                </Typography>
                                <Typography variant="h4" sx={{ mt: 1 }}>
                                    {value}
                                </Typography>
                            </SectionCard>
                        ))}
                    </Box>

                    <TimetablePreviewDiffViewer diff={preview.diff} />

                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <Box
                            sx={{
                                p: 3,
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 2,
                                alignItems: 'center',
                                flexWrap: 'wrap',
                            }}
                        >
                            <Stack spacing={0.5}>
                                <Typography variant="subtitle1">Preview report</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Review validation issues before applying the import.
                                </Typography>
                            </Stack>

                            <Button
                                variant="contained"
                                startIcon={
                                    applyMutation.isPending ? (
                                        <CircularProgress size={18} />
                                    ) : (
                                        <DoneAllOutlinedIcon />
                                    )
                                }
                                disabled={applyMutation.isPending || !preview.previewToken}
                                onClick={() => void handleApply()}
                            >
                                Apply preview
                            </Button>
                        </Box>

                        <Divider />

                        {!report?.issues || report.issues.length === 0 ? (
                            <Box sx={{ p: 3 }}>
                                <Alert severity="success">
                                    No validation issues found. This preview is ready to apply.
                                </Alert>
                            </Box>
                        ) : (
                            <Stack spacing={0} divider={<Divider />}>
                                {report.issues.map((issue, index) => (
                                    <Box
                                        key={`${issue.code}-${issue.lineNumber}-${index}`}
                                        sx={{
                                            p: 2.5,
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: '1fr',
                                                md: '44px minmax(0, 1fr) 160px',
                                            },
                                            gap: 2,
                                            alignItems: 'center',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: 2.5,
                                                display: 'grid',
                                                placeItems: 'center',
                                                bgcolor: alpha(theme.palette.warning.main, 0.12),
                                                color: 'warning.main',
                                            }}
                                        >
                                            <ReportProblemOutlinedIcon />
                                        </Box>

                                        <Stack spacing={0.5}>
                                            <Typography variant="subtitle2">
                                                {issue.message}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {issue.code}
                                            </Typography>
                                        </Stack>

                                        <Stack
                                            direction="row"
                                            justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                        >
                                            <StatusChip
                                                label={
                                                    issue.lineNumber
                                                        ? `Line ${issue.lineNumber}`
                                                        : 'Global'
                                                }
                                                variant="warning"
                                            />
                                        </Stack>
                                    </Box>
                                ))}
                            </Stack>
                        )}
                    </SectionCard>
                </>
            )}
        </PageContainer>
    );
}