import { Chip } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

type StatusChipProps = {
    label: string;
    variant?: StatusVariant;
};

export function StatusChip({ label, variant = 'default' }: StatusChipProps) {
    const theme = useTheme();

    const getStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    bgcolor: alpha(theme.palette.success.main, 0.14),
                    color: theme.palette.success.main,
                    borderColor: alpha(theme.palette.success.main, 0.24),
                };
            case 'warning':
                return {
                    bgcolor: alpha(theme.palette.warning.main, 0.16),
                    color: theme.palette.warning.main,
                    borderColor: alpha(theme.palette.warning.main, 0.24),
                };
            case 'error':
                return {
                    bgcolor: alpha(theme.palette.error.main, 0.14),
                    color: theme.palette.error.main,
                    borderColor: alpha(theme.palette.error.main, 0.24),
                };
            case 'info':
                return {
                    bgcolor: alpha(theme.palette.info.main, 0.14),
                    color: theme.palette.info.main,
                    borderColor: alpha(theme.palette.info.main, 0.24),
                };
            default:
                return {
                    bgcolor: alpha(theme.palette.text.primary, 0.06),
                    color: theme.palette.text.primary,
                    borderColor: alpha(theme.palette.text.primary, 0.08),
                };
        }
    };

    return (
        <Chip
            label={label}
            size="small"
            variant="outlined"
            sx={{
                fontWeight: 700,
                borderRadius: 999,
                height: 30,
                ...getStyles(),
                '& .MuiChip-label': {
                    px: 1.5,
                },
            }}
        />
    );
}