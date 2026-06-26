import { Box, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { ReactNode } from 'react';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';
import {
    DashboardIconBubble,
    DashboardMiniSparkline,
    getDashboardToneColor,
    type DashboardTone,
} from './dashboard-ui';

export function DashboardHeroCard({
                                      title,
                                      value,
                                      subtitle,
                                      icon,
                                      tone,
                                      trend,
                                      onClick,
                                  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: ReactNode;
    tone: DashboardTone;
    trend: string;
    onClick: () => void;
}) {
    const theme = useTheme();
    const color = getDashboardToneColor(theme, tone);

    return (
        <SectionCard
            onClick={onClick}
            sx={{
                p: 0,
                overflow: 'hidden',
                cursor: 'pointer',
                minHeight: 178,
                position: 'relative',
                transition: 'transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease',
                '&:hover': {
                    transform: 'translateY(-3px)',
                    borderColor: alpha(color, 0.35),
                    boxShadow: `0 18px 45px ${alpha(color, 0.12)}`,
                },
            }}
        >
            <Box sx={{ p: 2.5, position: 'relative', zIndex: 1 }}>
                <Stack spacing={2}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <DashboardIconBubble tone={tone}>{icon}</DashboardIconBubble>

                        <StatusChip
                            label={trend}
                            variant={tone === 'primary' ? 'info' : tone}
                        />
                    </Stack>

                    <Stack spacing={0.45}>
                        <Typography variant="body2" color="text.secondary" fontWeight={700}>
                            {title}
                        </Typography>

                        <Typography variant="h4" fontWeight={900}>
                            {value}
                        </Typography>

                        <Typography variant="body2" color="text.secondary">
                            {subtitle}
                        </Typography>
                    </Stack>

                    <DashboardMiniSparkline tone={tone} />
                </Stack>
            </Box>
        </SectionCard>
    );
}