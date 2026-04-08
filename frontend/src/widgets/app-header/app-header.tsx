import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import {
    AppBar,
    Box,
    IconButton,
    Tooltip,
    Toolbar,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { toggleLocale, toggleThemeMode } from '../../app/store/preferences.slice';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';
import { endSession } from '../../shared/auth/auth-session';

export function AppHeader() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const theme = useTheme();
    const themeMode = useAppSelector((state) => state.preferences.themeMode);
    const locale = useAppSelector((state) => state.preferences.locale);
    const user = useAppSelector((state) => state.auth.user);

    const handleLogout = () => {
        endSession(dispatch);
        navigate('/login', { replace: true });
    };

    return (
        <AppBar
            position="sticky"
            color="transparent"
            elevation={0}
            sx={{
                px: { xs: 2, md: 3 },
                borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                bgcolor:
                    theme.palette.mode === 'dark'
                        ? 'rgba(11,18,32,0.72)'
                        : 'rgba(255,255,255,0.78)',
                backdropFilter: 'blur(14px)',
            }}
        >
            <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h6">UniGate</Typography>
                    <Typography variant="body2" color="text.secondary">
                        {user?.displayName ?? t('layout.admin')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={t('actions.switchLanguage')}>
                        <IconButton onClick={() => dispatch(toggleLocale())}>
                            <LanguageOutlinedIcon />
                        </IconButton>
                    </Tooltip>

                    <Box
                        sx={{
                            minWidth: 36,
                            px: 1.25,
                            py: 0.75,
                            borderRadius: 999,
                            bgcolor: alpha(theme.palette.primary.main, theme.palette.mode === 'dark' ? 0.16 : 0.10),
                            color: 'primary.main',
                            textAlign: 'center',
                        }}
                    >
                        <Typography variant="caption" fontWeight={700}>
                            {locale.toUpperCase()}
                        </Typography>
                    </Box>

                    <Tooltip title={t('actions.switchTheme')}>
                        <IconButton onClick={() => dispatch(toggleThemeMode())}>
                            {themeMode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title="Sign out">
                        <IconButton onClick={handleLogout}>
                            <LogoutOutlinedIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
}