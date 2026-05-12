import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import {
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

export function ForbiddenPage() {
    const navigate = useNavigate();
    const theme = useTheme();

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                px: 3,
                bgcolor: 'background.default',
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 520,
                    borderRadius: 6,
                    p: { xs: 4, md: 5 },
                    border: '1px solid',
                    borderColor: alpha(theme.palette.error.main, 0.18),
                    bgcolor:
                        theme.palette.mode === 'dark'
                            ? alpha(theme.palette.error.main, 0.05)
                            : '#FFFFFF',
                    boxShadow:
                        theme.palette.mode === 'dark'
                            ? '0 20px 80px rgba(0,0,0,0.32)'
                            : '0 20px 80px rgba(15,23,42,0.08)',
                }}
            >
                <Stack spacing={3} alignItems="center" textAlign="center">
                    <Box
                        sx={{
                            width: 88,
                            height: 88,
                            borderRadius: 999,
                            display: 'grid',
                            placeItems: 'center',
                            bgcolor: alpha(theme.palette.error.main, 0.12),
                            color: 'error.main',
                        }}
                    >
                        <LockOutlinedIcon sx={{ fontSize: 42 }} />
                    </Box>

                    <Stack spacing={1}>
                        <Typography variant="h4" fontWeight={800}>
                            Access denied
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                maxWidth: 420,
                            }}
                        >
                            You do not have sufficient permissions to access this
                            section of the UniGate administration platform.
                        </Typography>
                    </Stack>

                    <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        width="100%"
                    >
                        <Button
                            fullWidth
                            variant="contained"
                            onClick={() => navigate('/admin/dashboard')}
                        >
                            Go to dashboard
                        </Button>

                        <Button
                            fullWidth
                            variant="outlined"
                            onClick={() => navigate(-1)}
                        >
                            Go back
                        </Button>
                    </Stack>
                </Stack>
            </Box>
        </Box>
    );
}