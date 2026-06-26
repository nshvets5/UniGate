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
import { SectionCard } from '../../shared/ui/section-card';
import { DashboardWidgetHeader } from './dashboard-ui';

export function QuickActionsWidget() {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'Access Workspace',
            icon: <ApartmentOutlinedIcon />,
            to: '/admin/zones',
        },
        {
            label: 'Access Attempts',
            icon: <RuleOutlinedIcon />,
            to: '/admin/attempts',
        },
        {
            label: 'Readers',
            icon: <SensorsOutlinedIcon />,
            to: '/admin/readers',
        },
        {
            label: 'Audit Log',
            icon: <HistoryOutlinedIcon />,
            to: '/admin/audit',
        },
        {
            label: 'Import Timetable',
            icon: <CalendarMonthOutlinedIcon />,
            to: '/admin/timetable/import',
        },
        {
            label: 'Timetable Sync',
            icon: <SyncOutlinedIcon />,
            to: '/admin/timetable/sync',
        },
        {
            label: 'Reader Emulator',
            icon: <LoginOutlinedIcon />,
            to: '/admin/emulator',
        },
    ];

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <DashboardWidgetHeader
                icon={<ShieldOutlinedIcon />}
                title="Quick actions"
                subtitle="Common administrative workflows."
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