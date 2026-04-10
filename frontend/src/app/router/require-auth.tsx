import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';

export function RequireAuth() {
    const { isAuthenticated, isBootstrapped } = useAppSelector(
        (state) => state.auth
    );
    const location = useLocation();

    if (!isBootstrapped) {
        return (
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'grid',
                    placeItems: 'center',
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}