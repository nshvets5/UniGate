import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { EmptyState } from '../../shared/ui/empty-state';
import { SectionCard } from '../../shared/ui/section-card';

type Props = {
    diff: unknown | null;
};

function formatDiff(diff: unknown) {
    try {
        return JSON.stringify(diff, null, 2);
    } catch {
        return String(diff);
    }
}

export function TimetablePreviewDiffViewer({ diff }: Props) {
    const theme = useTheme();

    if (!diff) {
        return (
            <EmptyState
                title="No semantic diff"
                description="The preview response does not contain semantic changes."
            />
        );
    }

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: 'primary.main',
                        }}
                    >
                        <DataObjectOutlinedIcon />
                    </Box>

                    <Stack>
                        <Typography variant="subtitle1">Semantic diff</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Structured changes detected before applying the timetable preview.
                        </Typography>
                    </Stack>
                </Stack>
            </Box>

            <Box
                component="pre"
                sx={{
                    m: 0,
                    p: 3,
                    maxHeight: 420,
                    overflow: 'auto',
                    borderTop: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.default',
                    fontSize: 13,
                    lineHeight: 1.6,
                }}
            >
                {formatDiff(diff)}
            </Box>
        </SectionCard>
    );
}