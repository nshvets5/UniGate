import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import VerifiedOutlinedIcon from '@mui/icons-material/VerifiedOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import DoorSlidingOutlinedIcon from '@mui/icons-material/DoorSlidingOutlined';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import {
    Box,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import {
    AccessTargetType,
    type AccessRuleDto,
} from '../../entities/access-rule/types';
import type { DoorDto } from '../../entities/door/types';
import type { RoomDto } from '../../entities/room/api';
import { SectionCard } from '../../shared/ui/section-card';

type Props = {
    rooms: RoomDto[];
    doors: DoorDto[];
    rules: AccessRuleDto[];
};

export function ZoneInsightsSection({
                                        rooms,
                                        doors,
                                        rules,
                                    }: Props) {
    const theme = useTheme();

    const inactiveRooms = rooms.filter((room) => !room.isActive);
    const inactiveDoors = doors.filter((door) => !door.isActive);

    const protectedRoomIds = new Set(
        rules
            .filter(
                (rule) =>
                    rule.targetType === AccessTargetType.Room
            )
            .map((rule) => rule.targetId)
    );

    const unprotectedRooms = rooms.filter(
        (room) => !protectedRoomIds.has(room.id)
    );

    const roomDoors = doors.filter((door) => door.roomId);

    const roomsWithoutDoors = rooms.filter(
        (room) =>
            !roomDoors.some(
                (door) => door.roomId === room.id
            )
    );

    const insights = [
        {
            title: 'Protected rooms',
            value: `${rooms.length - unprotectedRooms.length}/${rooms.length}`,
            description:
                unprotectedRooms.length === 0
                    ? 'All rooms have dedicated access rules.'
                    : `${unprotectedRooms.length} room(s) have no room-level rules.`,
            tone:
                unprotectedRooms.length === 0
                    ? 'success'
                    : 'warning',
            icon: <ShieldOutlinedIcon />,
        },
        {
            title: 'Inactive infrastructure',
            value: `${inactiveRooms.length + inactiveDoors.length}`,
            description: `${inactiveRooms.length} inactive room(s), ${inactiveDoors.length} inactive door(s).`,
            tone:
                inactiveRooms.length + inactiveDoors.length === 0
                    ? 'success'
                    : 'warning',
            icon: <WarningAmberOutlinedIcon />,
        },
        {
            title: 'Room connectivity',
            value: `${rooms.length - roomsWithoutDoors.length}/${rooms.length}`,
            description:
                roomsWithoutDoors.length === 0
                    ? 'All rooms are connected to doors.'
                    : `${roomsWithoutDoors.length} room(s) have no assigned doors.`,
            tone:
                roomsWithoutDoors.length === 0
                    ? 'success'
                    : 'warning',
            icon: <DoorSlidingOutlinedIcon />,
        },
        {
            title: 'Topology status',
            value: 'Healthy',
            description:
                'Zone hierarchy and access topology are operational.',
            tone: 'success',
            icon: <VerifiedOutlinedIcon />,
        },
    ];

    return (
        <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
            <Box sx={{ p: 3 }}>
                <Stack spacing={0.5}>
                    <Typography variant="subtitle1">
                        Access insights
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                    >
                        Diagnostics and topology health indicators.
                    </Typography>
                </Stack>
            </Box>

            <Box
                sx={{
                    px: 3,
                    pb: 3,
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        xl: 'repeat(2, minmax(0, 1fr))',
                    },
                    gap: 1.5,
                }}
            >
                {insights.map((insight) => {
                    const toneColor =
                        insight.tone === 'success'
                            ? theme.palette.success.main
                            : theme.palette.warning.main;

                    return (
                        <Box
                            key={insight.title}
                            sx={{
                                p: 2.25,
                                borderRadius: 4,
                                border: '1px solid',
                                borderColor: alpha(
                                    toneColor,
                                    0.24
                                ),
                                bgcolor: alpha(
                                    toneColor,
                                    0.06
                                ),
                            }}
                        >
                            <Stack spacing={1.5}>
                                <Stack
                                    direction="row"
                                    spacing={1.25}
                                    alignItems="center"
                                >
                                    <Box
                                        sx={{
                                            width: 42,
                                            height: 42,
                                            borderRadius: 3,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: alpha(
                                                toneColor,
                                                0.12
                                            ),
                                            color: toneColor,
                                        }}
                                    >
                                        {insight.icon}
                                    </Box>

                                    <Stack minWidth={0}>
                                        <Typography variant="subtitle2">
                                            {insight.title}
                                        </Typography>

                                        <Typography
                                            variant="h5"
                                            fontWeight={800}
                                        >
                                            {insight.value}
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                >
                                    {insight.description}
                                </Typography>
                            </Stack>
                        </Box>
                    );
                })}
            </Box>
        </SectionCard>
    );
}