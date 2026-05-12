import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import {
    Box,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../app/store/hooks';
import { appRoles, hasRole } from '../../shared/auth/roles';

const drawerWidth = 272;

const navSections = [
    {
        title: 'Overview',
        items: [
            {
                labelKey: 'navigation.dashboard',
                to: '/admin/dashboard',
                icon: <DashboardOutlinedIcon />,
            },
        ],
    },
    {
        title: 'Directory',
        items: [
            {
                labelKey: 'navigation.groups',
                to: '/admin/groups',
                icon: <GroupsOutlinedIcon />,
                adminOnly: true,
            },
            {
                labelKey: 'navigation.students',
                to: '/admin/students',
                icon: <SchoolOutlinedIcon />,
                adminOnly: true,
            },
        ],
    },
    {
        title: 'Access',
        items: [
            {
                labelKey: 'navigation.zones',
                to: '/admin/zones',
                icon: <LayersOutlinedIcon />,
                adminOnly: true,
            },
            {
                labelKey: 'navigation.attempts',
                to: '/admin/attempts',
                icon: <SecurityOutlinedIcon />,
                adminOnly: true,
            },
        ],
    },
    {
        title: 'Devices',
        items: [
            {
                labelKey: 'navigation.readers',
                to: '/admin/readers',
                icon: <MemoryOutlinedIcon />,
                adminOnly: true,
            },
            {
                labelKey: 'navigation.emulator',
                to: '/admin/emulator',
                icon: <TerminalOutlinedIcon />,
                adminOnly: true,
            },
        ],
    },
    {
        title: 'Timetable',
        items: [
            {
                labelKey: 'navigation.timetableImport',
                to: '/admin/timetable/import',
                icon: <CalendarMonthOutlinedIcon />,
                adminOnly: true,
            },
            {
                labelKey: 'navigation.timetableBatches',
                to: '/admin/timetable/batches',
                icon: <HistoryOutlinedIcon />,
                adminOnly: true,
            },
            {
                labelKey: 'navigation.timetableSync',
                to: '/admin/timetable/sync',
                icon: <SyncOutlinedIcon />,
                adminOnly: true,
            },
        ],
    },
    {
        title: 'System',
        items: [
            {
                labelKey: 'navigation.audit',
                to: '/admin/audit',
                icon: <ManageSearchOutlinedIcon />,
                adminOnly: true,
            },
            {
                labelKey: 'navigation.security',
                to: '/admin/profile/security',
                icon: <ShieldOutlinedIcon />,
            },
        ],
    },
];

type NavigationItem = {
    labelKey: string;
    to: string;
    icon: JSX.Element;
    adminOnly?: boolean;
};

type NavigationSection = {
    title: string;
    items: NavigationItem[];
};

export function AppSidebar() {
    const { t } = useTranslation();
    const theme = useTheme();
    const user = useAppSelector((state) => state.auth.user);
    const isAdmin = hasRole(user?.roles, appRoles.admin);

    return (
        <Box
            sx={{
                width: drawerWidth,
                height: '100vh',
                position: 'sticky',
                top: 0,
                borderRight: `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === 'dark' ? '#0F172A' : '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            <Toolbar
                sx={{
                    px: 3,
                    display: 'flex',
                    alignItems: 'center',
                }}
            >
                <Box>
                    <Typography variant="subtitle1" fontWeight={800}>
                        {t('app.title')}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        Access Control Platform
                    </Typography>
                </Box>
            </Toolbar>

            <Box
                sx={{
                    px: 2,
                    pb: 2,
                    overflowY: 'auto',
                }}
            >
                <StackedNavigation sections={navSections} isAdmin={isAdmin} />
            </Box>
        </Box>
    );
}

function StackedNavigation({
                               sections,
                               isAdmin,
                           }: {
    sections: NavigationSection[];
    isAdmin: boolean;
}) {
    const { t } = useTranslation();
    const theme = useTheme();

    const visibleSections = sections
        .map((section) => ({
            ...section,
            items: section.items.filter((item) => !item.adminOnly || isAdmin),
        }))
        .filter((section) => section.items.length > 0);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {visibleSections.map((section) => (
                <Box key={section.title}>
                    <Typography
                        variant="caption"
                        sx={{
                            px: 1.5,
                            mb: 0.75,
                            display: 'block',
                            color: 'text.secondary',
                            fontWeight: 800,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                        }}
                    >
                        {section.title}
                    </Typography>

                    <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, p: 0 }}>
                        {section.items.map((item) => (
                            <ListItemButton
                                key={item.to}
                                component={NavLink}
                                to={item.to}
                                sx={{
                                    px: 1.5,
                                    borderRadius: 2.5,
                                    '& .MuiListItemIcon-root': {
                                        minWidth: 40,
                                        color: 'text.secondary',
                                    },
                                    '& .MuiListItemText-primary': {
                                        fontWeight: 500,
                                    },
                                    '&:hover': {
                                        bgcolor: alpha(
                                            theme.palette.primary.main,
                                            theme.palette.mode === 'dark' ? 0.1 : 0.06
                                        ),
                                    },
                                    '&.active': {
                                        bgcolor: alpha(
                                            theme.palette.primary.main,
                                            theme.palette.mode === 'dark' ? 0.16 : 0.12
                                        ),
                                        '& .MuiListItemIcon-root': {
                                            color: theme.palette.primary.main,
                                        },
                                        '& .MuiListItemText-primary': {
                                            color: theme.palette.primary.main,
                                            fontWeight: 700,
                                        },
                                    },
                                }}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={t(item.labelKey)} />
                            </ListItemButton>
                        ))}
                    </List>
                </Box>
            ))}
        </Box>
    );
}