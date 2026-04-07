import { Chip } from '@mui/material';

type StatusVariant = 'success' | 'warning' | 'error' | 'info' | 'default';

type StatusChipProps = {
    label: string;
    variant?: StatusVariant;
};

export function StatusChip({ label, variant = 'default' }: StatusChipProps) {
    const getStyles = () => {
        switch (variant) {
            case 'success':
                return {
                    bgcolor: 'success.main',
                    color: 'success.contrastText',
                };
            case 'warning':
                return {
                    bgcolor: 'warning.main',
                    color: 'warning.contrastText',
                };
            case 'error':
                return {
                    bgcolor: 'error.main',
                    color: 'error.contrastText',
                };
            case 'info':
                return {
                    bgcolor: 'info.main',
                    color: 'info.contrastText',
                };
            default:
                return {
                    bgcolor: 'action.selected',
                    color: 'text.primary',
                };
        }
    };

    return (
        <Chip
            label={label}
            size="small"
            sx={{
                fontWeight: 700,
                borderRadius: 999,
                ...getStyles(),
            }}
        />
    );
}