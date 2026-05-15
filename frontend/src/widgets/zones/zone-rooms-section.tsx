import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import type { RoomDto } from '../../entities/room/api';
import type { ZoneDto } from '../../entities/zone/types';
import { CodeBadge } from '../../shared/ui/code-badge';
import { EmptyState } from '../../shared/ui/empty-state';
import { LoadingState } from '../../shared/ui/loading-state';
import { SectionCard } from '../../shared/ui/section-card';
import { StatusChip } from '../../shared/ui/status-chip';

type Props = {
    zone: ZoneDto;
    rooms: RoomDto[];
    isLoading: boolean;
};

export function ZoneRoomsSection({ zone, rooms, isLoading }: Props) {
    const theme = useTheme();

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle1">Rooms in {zone.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                        Rooms belong to a zone, but access rules may target rooms directly.
                    </Typography>
                </Stack>
            </Box>

            <Divider />

            {isLoading ? (
                <LoadingState
                    title="Loading rooms"
                    description="Please wait while zone rooms are being loaded."
                />
            ) : rooms.length === 0 ? (
                <EmptyState
                    title="No rooms in this zone"
                    description="Rooms assigned to this zone will appear here."
                />
            ) : (
                <Box
                    sx={{
                        p: 2.25,
                        display: 'grid',
                        gridTemplateColumns: {
                            xs: '1fr',
                            md: 'repeat(2, minmax(0, 1fr))',
                        },
                        gap: 1.5,
                    }}
                >
                    {rooms.map((room) => (
                        <Box
                            key={room.id}
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                border: '1px solid',
                                borderColor: room.isActive
                                    ? alpha(theme.palette.success.main, 0.22)
                                    : alpha(theme.palette.warning.main, 0.22),
                                bgcolor: 'background.paper',
                            }}
                        >
                            <Stack spacing={1.35}>
                                <Stack direction="row" spacing={1.25} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 38,
                                            height: 38,
                                            borderRadius: 2.5,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            color: 'primary.main',
                                        }}
                                    >
                                        <MeetingRoomOutlinedIcon fontSize="small" />
                                    </Box>

                                    <Stack minWidth={0} flex={1}>
                                        <Typography variant="subtitle2" noWrap>
                                            {room.name}
                                        </Typography>
                                        <CodeBadge value={room.code} />
                                    </Stack>

                                    <StatusChip
                                        label={room.isActive ? 'Active' : 'Inactive'}
                                        variant={room.isActive ? 'success' : 'warning'}
                                    />
                                </Stack>

                                <Typography variant="caption" color="text.secondary">
                                    Created: {new Date(room.createdAt).toLocaleString()}
                                </Typography>
                            </Stack>
                        </Box>
                    ))}
                </Box>
            )}
        </SectionCard>
    );
}