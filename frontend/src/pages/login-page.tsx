import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import {
    Alert,
    Box,
    Button,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../app/store/hooks';
import { startSession } from '../shared/auth/auth-session';

export function LoginPage() {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const [email, setEmail] = useState('admin@unigate.local');
    const [password, setPassword] = useState('Admin123!');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = () => {
        if (!email.trim() || !password.trim()) {
            setError('Please enter email and password.');
            return;
        }

        setError(null);

        startSession(dispatch, {
            accessToken: 'stub-token',
            user: {
                subject: 'stub-admin-subject',
                email,
                displayName: 'System Administrator',
                roles: ['Admin'],
            },
        });

        navigate('/admin/dashboard', { replace: true });
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
                    maxWidth: 460,
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
                                Enter your credentials to access the UniGate administration panel.
                            </Typography>
                        </Box>
                    </Stack>

                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        label="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        fullWidth
                    />

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<LoginOutlinedIcon />}
                        onClick={handleLogin}
                    >
                        Sign in
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}