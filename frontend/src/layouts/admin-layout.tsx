import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '../widgets/app-header/app-header';
import { AppSidebar } from '../widgets/app-sidebar/app-sidebar';

export function AdminLayout() {
    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppSidebar />

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <AppHeader />

                <Box component="main" sx={{ p: 3, flex: 1 }}>
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}