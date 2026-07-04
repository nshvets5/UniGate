import {
    Box,
    Button,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { StatusChip } from '../../shared/ui/status-chip';

export type DashboardTone = 'primary' | 'success' | 'warning' | 'error' | 'info';

export function getDashboardToneColor(theme: any, tone: DashboardTone) {
    switch (tone) {
        case 'success':
            return theme.palette.success.main;
        case 'warning':
            return theme.palette.warning.main;
        case 'error':
            return theme.palette.error.main;
        case 'info':
            return theme.palette.info.main;
        default:
            return theme.palette.primary.main;
    }
}

export function DashboardIconBubble({
                                        children,
                                        tone,
                                        compact,
                                    }: {
    children: ReactNode;
    tone: DashboardTone;
    compact?: boolean;
}) {
    const theme = useTheme();
    const color = getDashboardToneColor(theme, tone);

    return (
        <Box
            sx={{
                width: compact ? 38 : 46,
                height: compact ? 38 : 46,
                borderRadius: compact ? 2.5 : 3,
                display: 'grid',
                placeItems: 'center',
                bgcolor: alpha(color, 0.12),
                color,
                flexShrink: 0,
            }}
        >
            {children}
        </Box>
    );
}

export function DashboardWidgetHeader({
                                          icon,
                                          title,
                                          subtitle,
                                          actionLabel,
                                          onAction,
                                      }: {
    icon: ReactNode;
    title: string;
    subtitle: string;
    actionLabel?: string;
    onAction?: () => void;
}) {
    return (
        <Box sx={{ p: 3 }}>
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
            >
                <Stack direction="row" spacing={1.5} alignItems="center">
                    <DashboardIconBubble tone="primary">{icon}</DashboardIconBubble>

                    <Stack>
                        <Typography variant="subtitle1">{title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </Stack>
                </Stack>

                {actionLabel && onAction ? (
                    <Button variant="outlined" onClick={onAction}>
                        {actionLabel}
                    </Button>
                ) : null}
            </Stack>
        </Box>
    );
}

export function DashboardMiniSparkline({ tone }: { tone: DashboardTone }) {
    const theme = useTheme();
    const color = getDashboardToneColor(theme, tone);

    return (
        <Box
            component="svg"
            viewBox="0 0 220 42"
            sx={{ width: '100%', height: 42, mt: 0.5 }}
        >
            <path
                d="M2 28 C24 24, 32 34, 52 28 S82 20, 100 27 S132 35, 154 24 S184 8, 218 16"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
            />
        </Box>
    );
}

export function DashboardDonutChart({
                                        value,
                                        label,
                                        subtitle,
                                    }: {
    value: number;
    label: string;
    subtitle: string;
}) {
    const theme = useTheme();
    const radius = 48;
    const circumference = 2 * Math.PI * radius;
    const normalizedValue = Math.max(0, Math.min(value, 100));
    const offset = circumference - (normalizedValue / 100) * circumference;

    return (
        <Box sx={{ position: 'relative', width: 152, height: 152 }}>
            <svg width="152" height="152" viewBox="0 0 152 152">
                <circle
                    cx="76"
                    cy="76"
                    r={radius}
                    stroke={alpha(theme.palette.warning.main, 0.25)}
                    strokeWidth="16"
                    fill="none"
                />

                <circle
                    cx="76"
                    cy="76"
                    r={radius}
                    stroke={theme.palette.success.main}
                    strokeWidth="16"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    transform="rotate(-90 76 76)"
                />
            </svg>

            <Stack
                sx={{
                    position: 'absolute',
                    inset: 0,
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                }}
            >
                <Typography variant="h4" fontWeight={900}>
                    {label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {subtitle}
                </Typography>
            </Stack>
        </Box>
    );
}

export function DashboardLegendRow({
                                       label,
                                       value,
                                       tone,
                                   }: {
    label: string;
    value: number;
    tone: DashboardTone;
}) {
    const theme = useTheme();
    const color = getDashboardToneColor(theme, tone);

    return (
        <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1} alignItems="center">
                <Box
                    sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        bgcolor: color,
                    }}
                />
                <Typography variant="body2">{label}</Typography>
            </Stack>

            <Typography variant="body2" fontWeight={800}>
                {value}
            </Typography>
        </Stack>
    );
}

export function DashboardHealthRow({
                                       label,
                                       healthy,
                                       loading,
                                   }: {
    label: string;
    healthy: boolean;
    loading?: boolean;
}) {
    const { t } = useTranslation();

    return (
        <Box sx={{ px: 2.5, py: 1.75 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2">{label}</Typography>

                <StatusChip
                    label={
                        loading
                            ? t('common.loading')
                            : healthy
                                ? t('common.healthy')
                                : t('common.attention')
                    }
                    variant={loading ? 'info' : healthy ? 'success' : 'warning'}
                />
            </Stack>
        </Box>
    );
}