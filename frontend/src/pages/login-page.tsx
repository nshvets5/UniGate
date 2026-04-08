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

    const [token, setToken] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleLogin = () => {
        if (!token.trim()) {
            setError('Please enter an access token.');
            return;
        }

        setError(null);

        startSession(dispatch, {
            accessToken: token.trim(),
            user: {
                subject: 'bootstrap-pending',
                email: null,
                displayName: 'Loading profile...',
                roles: [],
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
                                Temporary development sign-in. Paste a valid bearer token to access the UniGate admin panel.
                            </Typography>
                        </Box>
                    </Stack>

                    <Alert severity="info">
                        This is a temporary auth screen. The app will validate the token against <strong>/api/me</strong>.
                    </Alert>

                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        label="Access token"
                        value={token}
                        onChange={(event) => setToken(event.target.value)}
                        fullWidth
                        multiline
                        minRows={4}
                    />

                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<LoginOutlinedIcon />}
                        onClick={handleLogin}
                    >
                        Continue
                    </Button>
                </Stack>
            </Paper>
        </Box>
    );
}