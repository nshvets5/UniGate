import { Box } from '@mui/material';
import { Outlet } from 'react-router-dom';
import { AppHeader } from '../widgets/app-header/app-header';
import { AppSidebar } from '../widgets/app-sidebar/app-sidebar';

export function AdminLayout() {
    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                bgcolor: 'background.default',
            }}
        >
            <AppSidebar />

            <Box
                sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <AppHeader />

                <Box
                    component="main"
                    sx={{
                        flex: 1,
                        px: { xs: 2, md: 3 },
                        py: { xs: 2, md: 3 },
                    }}
                >
                    <Outlet />
                </Box>
            </Box>
        </Box>
    );
}