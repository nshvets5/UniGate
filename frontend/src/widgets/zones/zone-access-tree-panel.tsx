import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
    Box,
    Button,
    Divider,
    InputAdornment,
    Skeleton,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ZoneDto } from '../../entities/zone/types';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    zones: ZoneDto[];
    selectedZoneId: string | null;
    search: string;
    isLoading: boolean;
    onSearchChange: (value: string) => void;
    onCreateClick: () => void;
    onSelectZone: (zone: ZoneDto) => void;
};

export function ZoneAccessTreePanel({
                                        zones,
                                        selectedZoneId,
                                        search,
                                        isLoading,
                                        onSearchChange,
                                        onCreateClick,
                                        onSelectZone,
                                    }: Props) {
    const theme = useTheme();

    return (
        <SectionCard
            sx={{
                p: 0,
                overflow: 'hidden',
                position: { xl: 'sticky' },
                top: { xl: 96 },
            }}
        >
            <Box sx={{ p: 3 }}>
                <Stack spacing={2.25}>
                    <Stack direction="row" justifyContent="space-between" gap={2}>
                        <Stack spacing={0.5}>
                            <Typography variant="subtitle1">
                                Campus access tree
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                Select a zone to manage doors and policies.
                            </Typography>
                        </Stack>

                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddOutlinedIcon />}
                            onClick={onCreateClick}
                        >
                            Zone
                        </Button>
                    </Stack>

                    <TextField
                        fullWidth
                        size="small"
                        value={search}
                        onChange={(event) => onSearchChange(event.target.value)}
                        placeholder="Search zones..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlinedIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Stack>
            </Box>

            <Divider />

            <Box sx={{ p: 1.5 }}>
                {isLoading ? (
                    <Stack spacing={1}>
                        {[1, 2, 3].map((item) => (
                            <Skeleton key={item} height={86} sx={{ borderRadius: 3 }} />
                        ))}
                    </Stack>
                ) : zones.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography variant="subtitle2">No zones found</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                            Create a zone to start building the access structure.
                        </Typography>
                    </Box>
                ) : (
                    <Stack spacing={1}>
                        {zones.map((zone) => {
                            const selected = zone.id === selectedZoneId;

                            return (
                                <Box
                                    key={zone.id}
                                    component="button"
                                    type="button"
                                    onClick={() => onSelectZone(zone)}
                                    sx={{
                                        width: '100%',
                                        textAlign: 'left',
                                        border: '1px solid',
                                        borderColor: selected
                                            ? alpha(theme.palette.primary.main, 0.42)
                                            : 'divider',
                                        bgcolor: selected
                                            ? alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.14 : 0.07)
                                            : 'background.paper',
                                        borderRadius: 3,
                                        p: 1.75,
                                        cursor: 'pointer',
                                        transition:
                                            'border-color 0.18s ease, background-color 0.18s ease, transform 0.18s ease',
                                        '&:hover': {
                                            borderColor: alpha(theme.palette.primary.main, 0.5),
                                            transform: 'translateY(-1px)',
                                        },
                                    }}
                                >
                                    <Stack spacing={1.25}>
                                        <Stack direction="row" spacing={1.25} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 38,
                                                    height: 38,
                                                    borderRadius: 2.5,
                                                    display: 'grid',
                                                    placeItems: 'center',
                                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                                    color: 'primary.main',
                                                }}
                                            >
                                                <AccountTreeOutlinedIcon fontSize="small" />
                                            </Box>

                                            <Stack minWidth={0} flex={1}>
                                                <Typography variant="subtitle2" noWrap>
                                                    {zone.name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary" noWrap>
                                                    {zone.code}
                                                </Typography>
                                            </Stack>

                                            <StatusChip
                                                label={zone.isActive ? 'Active' : 'Inactive'}
                                                variant={zone.isActive ? 'success' : 'warning'}
                                            />
                                        </Stack>

                                        <Box
                                            sx={{
                                                ml: 2.25,
                                                pl: 2,
                                                borderLeft: '1px dashed',
                                                borderColor: alpha(theme.palette.text.secondary, 0.24),
                                            }}
                                        >
                                            <Stack spacing={0.75}>
                                                <TreeChild
                                                    icon={<DoorSlidingOutlinedIcon fontSize="small" />}
                                                    label="Doors"
                                                />
                                                <TreeChild
                                                    icon={<RuleOutlinedIcon fontSize="small" />}
                                                    label="Access rules"
                                                />
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </Box>
                            );
                        })}
                    </Stack>
                )}
            </Box>
        </SectionCard>
    );
}

function TreeChild({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <Stack direction="row" spacing={1} alignItems="center">
            <Box sx={{ color: 'text.secondary', display: 'flex' }}>
                {icon}
            </Box>
            <Typography variant="caption" color="text.secondary">
                {label}
            </Typography>
        </Stack>
    );
}