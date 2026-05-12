import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import {
    Box,
    Button,
    CircularProgress,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '../app/store/hooks';
import { keycloak } from '../shared/auth/keycloak';

export function LoginPage() {
    const theme = useTheme();
    const location = useLocation();
    const [isRedirecting, setIsRedirecting] = useState(false);

    const { isAuthenticated, isBootstrapped } = useAppSelector(
        (state) => state.auth
    );

    const from =
        (location.state as { from?: Location } | null)?.from?.pathname ??
        '/admin/dashboard';

    useEffect(() => {
        if (isAuthenticated) {
            setIsRedirecting(false);
        }
    }, [isAuthenticated]);

    if (!isBootstrapped) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                    bgcolor: 'background.default',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (isAuthenticated) {
        return <Navigate to={from} replace />;
    }

    const handleLogin = async () => {
        setIsRedirecting(true);

        await keycloak.login({
            redirectUri: `${window.location.origin}${from}`,
        });
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', lg: '1.05fr 0.95fr' },
                bgcolor: 'background.default',
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    px: { xs: 3, md: 6 },
                    py: 6,
                }}
            >
                <Box sx={{ width: '100%', maxWidth: 520 }}>
                    <Stack spacing={4}>
                        <Stack spacing={1.5}>
                            <Typography variant="overline" color="primary" fontWeight={800}>
                                UniGate Access Control Platform
                            </Typography>

                            <Typography variant="h3" fontWeight={900} letterSpacing="-0.04em">
                                Secure access management for educational institutions.
                            </Typography>

                            <Typography variant="body1" color="text.secondary">
                                Sign in to monitor readers, manage directory data, configure access rules
                                and control timetable-driven permissions.
                            </Typography>
                        </Stack>

                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor:
                                    theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.background.paper, 0.72)
                                        : '#FFFFFF',
                                boxShadow:
                                    theme.palette.mode === 'dark'
                                        ? '0 24px 80px rgba(0,0,0,0.28)'
                                        : '0 24px 80px rgba(15,23,42,0.08)',
                            }}
                        >
                            <Stack spacing={2.5}>
                                <Stack spacing={0.5}>
                                    <Typography variant="h6">Identity provider sign-in</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Authentication is handled by Keycloak using OpenID Connect.
                                    </Typography>
                                </Stack>

                                <Button
                                    fullWidth
                                    size="large"
                                    variant="contained"
                                    startIcon={
                                        isRedirecting ? (
                                            <CircularProgress size={18} color="inherit" />
                                        ) : (
                                            <LoginOutlinedIcon />
                                        )
                                    }
                                    onClick={() => void handleLogin()}
                                    disabled={isRedirecting}
                                >
                                    {isRedirecting ? 'Redirecting...' : 'Continue with Keycloak'}
                                </Button>

                                <Typography variant="caption" color="text.secondary">
                                    Access to administrative modules depends on your assigned roles.
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>
                </Box>
            </Box>

            <Box
                sx={{
                    display: { xs: 'none', lg: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 6,
                    background:
                        theme.palette.mode === 'dark'
                            ? 'radial-gradient(circle at top, rgba(37,99,235,0.35), transparent 34%), linear-gradient(145deg, #020617 0%, #0F172A 100%)'
                            : 'radial-gradient(circle at top, rgba(37,99,235,0.18), transparent 34%), linear-gradient(145deg, #EFF6FF 0%, #F8FAFC 100%)',
                }}
            >
                <Stack spacing={2.5} sx={{ width: '100%', maxWidth: 460 }}>
                    {[
                        {
                            icon: <SecurityOutlinedIcon />,
                            title: 'Centralized access control',
                            description: 'Manage zones, doors, readers and access decisions from one workspace.',
                        },
                        {
                            icon: <VerifiedUserOutlinedIcon />,
                            title: 'Identity-aware permissions',
                            description: 'Role-based UI and backend authorization protect administrative workflows.',
                        },
                    ].map((item) => (
                        <Box
                            key={item.title}
                            sx={{
                                p: 3,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: alpha(theme.palette.primary.main, 0.18),
                                bgcolor:
                                    theme.palette.mode === 'dark'
                                        ? 'rgba(15,23,42,0.72)'
                                        : 'rgba(255,255,255,0.82)',
                                backdropFilter: 'blur(14px)',
                            }}
                        >
                            <Stack direction="row" spacing={2}>
                                <Box
                                    sx={{
                                        width: 46,
                                        height: 46,
                                        borderRadius: 3,
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                                        color: 'primary.main',
                                    }}
                                >
                                    {item.icon}
                                </Box>

                                <Stack spacing={0.5}>
                                    <Typography variant="subtitle1">{item.title}</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {item.description}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
}