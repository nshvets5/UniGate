import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import {
    Box,
    Divider,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';

const drawerWidth = 260;

const navItems = [
    {
        labelKey: 'navigation.dashboard',
        to: '/admin/dashboard',
        icon: <DashboardOutlinedIcon />,
    },
    {
        labelKey: 'navigation.groups',
        to: '/admin/groups',
        icon: <GroupsOutlinedIcon />,
    },
    {
        labelKey: 'navigation.students',
        to: '/admin/students',
        icon: <SchoolOutlinedIcon />,
    },
];

export function AppSidebar() {
    const { t } = useTranslation();

    return (
        <Box
            sx={{
                width: drawerWidth,
                height: '100vh',
                borderRight: (theme) => `1px solid ${theme.palette.divider}`,
                display: 'flex',
                flexDirection: 'column',
                bgcolor: 'background.paper',
            }}
        >
            <Toolbar>
                <Typography variant="h6" fontWeight={700}>
                    {t('app.title')}
                </Typography>
            </Toolbar>

            <Divider />

            <List sx={{ px: 1, py: 1 }}>
                {navItems.map((item) => (
                    <ListItemButton
                        key={item.to}
                        component={NavLink}
                        to={item.to}
                        sx={{
                            mb: 0.5,
                            borderRadius: 2,
                            '&.active': {
                                bgcolor: 'action.selected',
                            },
                        }}
                    >
                        <ListItemIcon>{item.icon}</ListItemIcon>
                        <ListItemText primary={t(item.labelKey)} />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
}