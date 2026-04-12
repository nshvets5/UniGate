import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ZoneDto } from '../../entities/zone/types';
import { CodeBadge } from '../../shared/ui/code-badge';
import { StatusChip } from '../../shared/ui/status-chip';

type ZoneListItemProps = {
    zone: ZoneDto;
    selected: boolean;
    onClick: () => void;
};

export function ZoneListItem({
                                 zone,
                                 selected,
                                 onClick,
                             }: ZoneListItemProps) {
    const theme = useTheme();

    return (
        <Box
            component="button"
            type="button"
            onClick={onClick}
            sx={{
                all: 'unset',
                display: 'block',
                cursor: 'pointer',
                width: '100%',
            }}
        >
            <Box
                sx={{
                    p: 1.5,
                    borderRadius: 3,
                    border: `1px solid ${
                        selected
                            ? alpha(theme.palette.primary.main, 0.28)
                            : theme.palette.divider
                    }`,
                    bgcolor: selected
                        ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.12 : 0.08)
                        : 'background.paper',
                    transition: 'all 0.18s ease',
                    '&:hover': {
                        borderColor: alpha(theme.palette.primary.main, 0.24),
                        bgcolor: selected
                            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.1)
                            : alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.06 : 0.03),
                    },
                }}
            >
                <Stack spacing={1}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="flex-start"
                        gap={1}
                    >
                        <Typography variant="subtitle2" sx={{ textAlign: 'left' }}>
                            {zone.name}
                        </Typography>

                        <StatusChip
                            label={zone.isActive ? 'Active' : 'Inactive'}
                            variant={zone.isActive ? 'success' : 'warning'}
                        />
                    </Stack>

                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <CodeBadge value={zone.code} />
                    </Stack>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                            textAlign: 'left',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            minHeight: 40,
                        }}
                    >
                        {zone.description || 'No description provided'}
                    </Typography>
                </Stack>
            </Box>
        </Box>
    );
}