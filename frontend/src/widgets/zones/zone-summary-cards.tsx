import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import DoorFrontOutlinedIcon from '@mui/icons-material/DoorFrontOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

const items = [
    {
        label: 'Doors',
        value: '—',
        icon: <DoorFrontOutlinedIcon />,
    },
    {
        label: 'Readers',
        value: '—',
        icon: <SensorsOutlinedIcon />,
    },
    {
        label: 'Rules',
        value: '—',
        icon: <VerifiedUserOutlinedIcon />,
    },
    {
        label: 'Linked entities',
        value: '—',
        icon: <ApartmentOutlinedIcon />,
    },
];

export function ZoneSummaryCards() {
    const theme = useTheme();

    return (
        <Grid container spacing={2}>
            {items.map((item) => (
                <Grid key={item.label} size={{ xs: 12, sm: 6, xl: 3 }}>
                    <Box
                        sx={{
                            p: 2,
                            borderRadius: 3,
                            border: `1px solid ${theme.palette.divider}`,
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Stack spacing={0.75}>
                                <Typography variant="body2" color="text.secondary">
                                    {item.label}
                                </Typography>
                                <Typography variant="h6">{item.value}</Typography>
                            </Stack>

                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2.5,
                                    display: 'grid',
                                    placeItems: 'center',
                                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                                    color: 'primary.main',
                                }}
                            >
                                {item.icon}
                            </Box>
                        </Stack>
                    </Box>
                </Grid>
            ))}
        </Grid>
    );
}