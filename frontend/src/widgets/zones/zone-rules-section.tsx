import PauseCircleOutlineOutlinedIcon from '@mui/icons-material/PauseCircleOutlineOutlined';
import PlayCircleOutlineOutlinedIcon from '@mui/icons-material/PlayCircleOutlineOutlined';
import {
    Box,
    CircularProgress,
    Divider,
    IconButton,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { useMemo } from 'react';
import type { ZoneDto } from '../../entities/zone/types';
import type { AccessRuleDto } from '../../entities/access-rule/types';
import { useAccessRulesQuery } from '../../features/access-rules/list-access-rules/use-access-rules-query';
import { useToggleAccessRuleActiveMutation } from '../../features/access-rules/toggle-access-rule-active/use-toggle-access-rule-active-mutation';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { EntityRow } from '../../shared/ui/entity-row';
import { EntityTable, EntityTableHeaderCell } from '../../shared/ui/entity-table';
import { ErrorState } from '../../shared/ui/error-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { RowActions } from '../../shared/ui/row-actions';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type ZoneRulesSectionProps = {
    zone: ZoneDto;
};

function formatRulePeriod(rule: AccessRuleDto) {
    if (!rule.validFrom && !rule.validTo) return 'No validity period';

    const from = rule.validFrom
        ? new Date(rule.validFrom).toLocaleDateString()
        : 'Any start';

    const to = rule.validTo
        ? new Date(rule.validTo).toLocaleDateString()
        : 'No end';

    return `${from} → ${to}`;
}

export function ZoneRulesSection({ zone }: ZoneRulesSectionProps) {
    const desktopColumns = 'minmax(240px, 1.7fr) 160px 140px 140px';

    const queryParams = useMemo(
        () => ({
            zoneId: zone.id,
            page: 1,
            pageSize: 20,
        }),
        [zone.id]
    );

    const rulesQuery = useAccessRulesQuery(queryParams);
    const toggleMutation = useToggleAccessRuleActiveMutation();

    const handleToggleActive = async (rule: AccessRuleDto) => {
        await toggleMutation.mutateAsync({
            id: rule.id,
            isActive: !rule.isActive,
        });
    };

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <Stack spacing={0}>
                <Box sx={{ p: 3 }}>
                    <Typography variant="subtitle1">Access rules</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Access policies linked to the selected zone. Rule creation requires group and schedule configuration.
                    </Typography>
                </Box>

                <Divider />

                {rulesQuery.isLoading ? (
                    <LoadingState
                        title="Loading access rules"
                        description="Please wait while zone rules are being loaded."
                    />
                ) : rulesQuery.isError ? (
                    <ErrorState
                        title="Failed to load access rules"
                        description="The rules list could not be loaded from the server."
                        onRetry={() => void rulesQuery.refetch()}
                    />
                ) : !rulesQuery.data || rulesQuery.data.items.length === 0 ? (
                    <EmptyState
                        title="No access rules found"
                        description="No access policies are currently linked to this zone."
                    />
                ) : (
                    <Stack spacing={0} sx={{ p: 2.25 }}>
                        <EntityTable
                            gridTemplateColumns={desktopColumns}
                            columns={
                                <>
                                    <EntityTableHeaderCell>Rule</EntityTableHeaderCell>
                                    <EntityTableHeaderCell align="center">Windows</EntityTableHeaderCell>
                                    <EntityTableHeaderCell align="center">Status</EntityTableHeaderCell>
                                    <EntityTableHeaderCell align="right">Actions</EntityTableHeaderCell>
                                </>
                            }
                        >
                            {rulesQuery.data.items.map((rule) => {
                                const isTogglingCurrent =
                                    toggleMutation.isPending &&
                                    toggleMutation.variables?.id === rule.id;

                                return (
                                    <EntityRow key={rule.id}>
                                        <Box
                                            sx={{
                                                display: 'grid',
                                                gridTemplateColumns: {
                                                    xs: '1fr',
                                                    md: desktopColumns,
                                                },
                                                alignItems: 'center',
                                                columnGap: 2,
                                                rowGap: 1.5,
                                                pl: { xs: 0, md: 1.25 },
                                            }}
                                        >
                                            <Stack spacing={0.45} minWidth={0}>
                                                <Typography variant="subtitle1" noWrap>
                                                    Group rule
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {formatRulePeriod(rule)}
                                                </Typography>
                                            </Stack>

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: { xs: 'flex-start', md: 'center' },
                                                    minHeight: 40,
                                                }}
                                            >
                                                <CodeBadge value={`${rule.windows?.length ?? 0} window(s)`} />
                                            </Box>

                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: { xs: 'flex-start', md: 'center' },
                                                    minHeight: 40,
                                                }}
                                            >
                                                <StatusChip
                                                    label={rule.isActive ? 'Active' : 'Inactive'}
                                                    variant={rule.isActive ? 'success' : 'warning'}
                                                />
                                            </Box>

                                            <Stack
                                                direction="row"
                                                spacing={0.5}
                                                justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                                                alignItems="center"
                                            >
                                                <RowActions>
                                                    <Tooltip
                                                        title={rule.isActive ? 'Deactivate rule' : 'Activate rule'}
                                                    >
                            <span>
                              <IconButton
                                  onClick={() => void handleToggleActive(rule)}
                                  disabled={isTogglingCurrent}
                              >
                                {isTogglingCurrent ? (
                                    <CircularProgress size={18} />
                                ) : rule.isActive ? (
                                    <PauseCircleOutlineOutlinedIcon />
                                ) : (
                                    <PlayCircleOutlineOutlinedIcon />
                                )}
                              </IconButton>
                            </span>
                                                    </Tooltip>
                                                </RowActions>
                                            </Stack>
                                        </Box>
                                    </EntityRow>
                                );
                            })}
                        </EntityTable>
                    </Stack>
                )}
            </Stack>
        </SectionCard>
    );
}