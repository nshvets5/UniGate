import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';
import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector } from '../app/store/hooks';
import { keycloak } from '../shared/auth/keycloak';

export function LoginPage() {
    const navigate = useNavigate();
    const { isAuthenticated, isBootstrapped } = useAppSelector(
        (state) => state.auth
    );

    useEffect(() => {
        if (isBootstrapped && isAuthenticated) {
            navigate('/admin/dashboard', { replace: true });
        }
    }, [isAuthenticated, isBootstrapped, navigate]);

    if (isBootstrapped && isAuthenticated) {
        return <Navigate to="/admin/dashboard" replace />;
    }

    const handleLogin = async () => {
        await keycloak.login({
            redirectUri: `${window.location.origin}/admin/dashboard`,
        });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                placeItems: 'center',
                px: 2,
                bgcolor: 'background.default',
            }}
        >
            <Paper
                sx={{
                    width: '100%',
                    maxWidth: 520,
                    p: 4,
                    borderRadius: 4,
                    border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
            >
                <Stack spacing={3}>
                    <Stack spacing={1} alignItems="flex-start">
                        <Box
                            sx={{
                                width: 52,
                                height: 52,
                                borderRadius: 3,
                                display: 'grid',
                                placeItems: 'center',
                                bgcolor: 'primary.main',
                                color: 'primary.contrastText',
                            }}
                        >
                            <LockOutlinedIcon />
                        </Box>

                        <Box>
                            <Typography variant="h4">Sign in</Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Sign in with Keycloak to access the UniGate administration panel.
                            </Typography>
                        </Box>
                    </Stack>

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<LoginOutlinedIcon />}
                        onClick={() => void handleLogin()}
                    >
                        Continue with Keycloak
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}