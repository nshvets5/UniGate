import { Paper, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

export function GroupsPage() {
    const { t } = useTranslation();

    return (
        <Paper sx={{ p: 3, borderRadius: 3 }}>
            <Typography variant="h4" fontWeight={700}>
                {t('pages.groups.title')}
            </Typography>
        </Paper>
    );
}