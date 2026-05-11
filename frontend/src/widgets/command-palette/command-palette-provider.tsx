import ApartmentOutlinedIcon from '@mui/icons-material/ApartmentOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import ManageSearchOutlinedIcon from '@mui/icons-material/ManageSearchOutlined';
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import SyncOutlinedIcon from '@mui/icons-material/SyncOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CommandPalette } from './command-palette';

type CommandPaletteContextValue = {
    openCommandPalette: () => void;
};

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null);

export function useCommandPalette() {
    const context = useContext(CommandPaletteContext);

    if (!context) {
        throw new Error('useCommandPalette must be used inside CommandPaletteProvider');
    }

    return context;
}

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
    const [open, setOpen] = useState(false);

    const commands = useMemo(
        () => [
            {
                title: 'Dashboard',
                description: 'Open operational overview dashboard',
                path: '/admin/dashboard',
                icon: <DashboardOutlinedIcon />,
                keywords: ['overview', 'home', 'operations'],
            },
            {
                title: 'Groups',
                description: 'Manage academic groups',
                path: '/admin/groups',
                icon: <GroupsOutlinedIcon />,
                keywords: ['directory', 'academic', 'group'],
            },
            {
                title: 'Students',
                description: 'Manage students and credentials',
                path: '/admin/students',
                icon: <SchoolOutlinedIcon />,
                keywords: ['directory', 'student', 'credentials'],
            },
            {
                title: 'Access workspace',
                description: 'Manage zones, doors and access rules',
                path: '/admin/zones',
                icon: <ApartmentOutlinedIcon />,
                keywords: ['zones', 'doors', 'rules', 'access'],
            },
            {
                title: 'Access attempts',
                description: 'Open access attempts monitoring page',
                path: '/admin/attempts',
                icon: <SecurityOutlinedIcon />,
                keywords: ['attempts', 'scan', 'allow', 'deny'],
            },
            {
                title: 'Readers',
                description: 'Manage reader devices',
                path: '/admin/readers',
                icon: <MemoryOutlinedIcon />,
                keywords: ['devices', 'reader', 'rfid', 'qr'],
            },
            {
                title: 'Reader emulator',
                description: 'Simulate RFID, QR and manual scans',
                path: '/admin/emulator',
                icon: <TerminalOutlinedIcon />,
                keywords: ['emulator', 'scan', 'device'],
            },
            {
                title: 'Timetable import',
                description: 'Upload CSV or ICS timetable files',
                path: '/admin/timetable/import',
                icon: <CalendarMonthOutlinedIcon />,
                keywords: ['timetable', 'import', 'csv', 'ics'],
            },
            {
                title: 'Timetable batches',
                description: 'Review timetable import history',
                path: '/admin/timetable/batches',
                icon: <HistoryOutlinedIcon />,
                keywords: ['timetable', 'batches', 'history', 'rollback'],
            },
            {
                title: 'Timetable sync',
                description: 'Open timetable synchronization diagnostics',
                path: '/admin/timetable/sync',
                icon: <SyncOutlinedIcon />,
                keywords: ['timetable', 'sync', 'diagnostics'],
            },
            {
                title: 'Audit log',
                description: 'Review system audit events',
                path: '/admin/audit',
                icon: <ManageSearchOutlinedIcon />,
                keywords: ['audit', 'events', 'activity', 'log'],
            },
            {
                title: 'Security profile',
                description: 'Open account security profile',
                path: '/admin/profile/security',
                icon: <ShieldOutlinedIcon />,
                keywords: ['profile', 'security', 'keycloak', 'email'],
            },
        ],
        []
    );

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const isShortcut =
                (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';

            if (!isShortcut) return;

            event.preventDefault();
            setOpen((current) => !current);
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const value = useMemo(
        () => ({
            openCommandPalette: () => setOpen(true),
        }),
        []
    );

    return (
        <CommandPaletteContext.Provider value={value}>
            {children}

            <CommandPalette
                open={open}
                onClose={() => setOpen(false)}
                commands={commands}
            />
        </CommandPaletteContext.Provider>
    );
}