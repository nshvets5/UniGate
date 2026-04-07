import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import {
    AppBar,
    Box,
    IconButton,
    Toolbar,
    Tooltip,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { toggleLocale, toggleThemeMode } from '../../app/store/preferences.slice';
import { useAppDispatch, useAppSelector } from '../../app/store/hooks';

export function AppHeader() {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const themeMode = useAppSelector((state) => state.preferences.themeMode);
    const locale = useAppSelector((state) => state.preferences.locale);

    return (
        <AppBar
            position="static"
            color="transparent"
            elevation={0}
            sx={{
                borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                bgcolor: 'background.paper',
            }}
        >
            <Toolbar sx={{ justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h6" fontWeight={700}>
                        {t('layout.admin')}
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Tooltip title={t('actions.switchLanguage')}>
                        <IconButton onClick={() => dispatch(toggleLocale())}>
                            <LanguageOutlinedIcon />
                        </IconButton>
                    </Tooltip>

                    <Typography variant="body2" sx={{ minWidth: 28 }}>
                        {locale.toUpperCase()}
                    </Typography>

                    <Tooltip title={t('actions.switchTheme')}>
                        <IconButton onClick={() => dispatch(toggleThemeMode())}>
                            {themeMode === 'light' ? <DarkModeOutlinedIcon /> : <LightModeOutlinedIcon />}
                        </IconButton>
                    </Tooltip>
                </Box>
            </Toolbar>
        </AppBar>
    );
}