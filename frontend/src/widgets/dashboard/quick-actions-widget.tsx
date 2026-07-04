import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LoginOutlinedIcon from '@mui/icons-material/LoginOutlined';
import RuleOutlinedIcon from '@mui/icons-material/RuleOutlined';
import SensorsOutlinedIcon from '@mui/icons-material/SensorsOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import {
    Box,
    Button,
    Divider,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SectionCard } from '../../shared/ui/section-card';
import { DashboardWidgetHeader } from './dashboard-ui';

export function QuickActionsWidget() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    const actions = [
        {
            label: t('dashboard.accessWorkspace'),
            icon: <ApartmentOutlinedIcon />,
            to: '/admin/zones',
        },
        {
            label: t('navigation.attempts'),
            icon: <RuleOutlinedIcon />,
            to: '/admin/attempts',
        },
        {
            label: t('dashboard.readers'),
            icon: <SensorsOutlinedIcon />,
            to: '/admin/readers',
        },
        {
            label: t('dashboard.auditLog'),
            icon: <HistoryOutlinedIcon />,
            to: '/admin/audit',
        },
        {
            label: t('dashboard.importTimetable'),
            icon: <CalendarMonthOutlinedIcon />,
            to: '/admin/timetable/import',
        },
        {
            label: t('dashboard.timetableSync'),
            icon: <SyncOutlinedIcon />,
            to: '/admin/timetable/sync',
        },
        {
            label: t('dashboard.readerEmulator'),
            icon: <LoginOutlinedIcon />,
            to: '/admin/emulator',
        },
    ];

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <DashboardWidgetHeader
                icon={<ShieldOutlinedIcon />}
                title={t('dashboard.quickActions')}
                subtitle={t('dashboard.quickActionsSubtitle')}
            />

            <Divider />

            <Box
                sx={{
                    p: 2.5,
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: '1fr 1fr',
                    },
                    gap: 1.25,
                }}
            >
                {actions.map((action) => (
                    <Button
                        key={action.label}
                        variant="outlined"
                        startIcon={action.icon}
                        sx={{
                            justifyContent: 'flex-start',
                            py: 1.15,
                        }}
                        onClick={() =>
                            navigate(action.to)
                        }
                    >
                        {action.label}
                    </Button>
                ))}
            </Box>
        </SectionCard>
    );
}