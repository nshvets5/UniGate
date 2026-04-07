import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';

export function AdminLayout() {
    return (
        <Box p={2}>
            <h2>UniGate Admin</h2>
            <Outlet />
        </Box>
    );
}