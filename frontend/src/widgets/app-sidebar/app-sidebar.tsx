import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
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
            },
            {
                labelKey: 'navigation.students',
                to: '/admin/students',
                icon: <SchoolOutlinedIcon />,
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
            },
            {
                labelKey: 'navigation.attempts',
                to: '/admin/attempts',
                icon: <SecurityOutlinedIcon />,
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
            },
            {
                labelKey: 'navigation.emulator',
                to: '/admin/emulator',
                icon: <TerminalOutlinedIcon />,
            },
        ],
    },
    {
        title: 'Timetable',
        items: [
            {
                labelKey: 'navigation.timetable',
                to: '/admin/timetable/import',
                icon: <CalendarMonthOutlinedIcon />,
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
            },
            {
                labelKey: 'navigation.security',
                to: '/admin/profile/security',
                icon: <ShieldOutlinedIcon />,
            },
        ],
    },
];

export function AppSidebar() {
    const { t } = useTranslation();
    const theme = useTheme();

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
                <StackedNavigation sections={navSections} />
            </Box>
        </Box>
    );
}

type NavigationSection = (typeof navSections)[number];

function StackedNavigation({ sections }: { sections: NavigationSection[] }) {
    const { t } = useTranslation();
    const theme = useTheme();

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            {sections.map((section) => (
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