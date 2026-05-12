import { Box, CircularProgress } from '@mui/material';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { hasAnyRole } from '../../shared/auth/roles';

type RequireRoleProps = {
    roles: string[];
};

export function RequireRole({ roles }: RequireRoleProps) {
    const { user, isBootstrapped, isAuthenticated } = useAppSelector(
        (state) => state.auth
    );

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
        return <Navigate to="/login" replace />;
    }

    if (!hasAnyRole(user?.roles, roles)) {
        return <Navigate to="/forbidden" replace />;
    }

    return <Outlet />;
}