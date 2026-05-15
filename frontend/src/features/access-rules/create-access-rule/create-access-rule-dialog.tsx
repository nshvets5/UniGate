import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
    Alert,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import { AccessTargetType } from '../../../entities/access-rule/types';
import type { DoorDto } from '../../../entities/door/types';
import type { GroupDto } from '../../../entities/group/types';
import type { RoomDto } from '../../../entities/room/api';
import type { ZoneDto } from '../../../entities/zone/types';
import { useCreateAccessRuleMutation } from './use-create-access-rule-mutation';

type Props = {
    open: boolean;
    defaultTargetType: AccessTargetType;
    defaultTargetId: string;
    zones: ZoneDto[];
    rooms: RoomDto[];
    doors: DoorDto[];
    groups: GroupDto[];
    onClose: () => void;
};

const days = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 7, label: 'Sun' },
];

const targetTypes = [
    { value: AccessTargetType.Zone, label: 'Zone' },
    { value: AccessTargetType.Room, label: 'Room' },
    { value: AccessTargetType.Door, label: 'Door' },
];

export function CreateAccessRuleDialog({
                                           open,
                                           defaultTargetType,
                                           defaultTargetId,
                                           zones,
                                           rooms,
                                           doors,
                                           groups,
                                           onClose,
                                       }: Props) {
    const [groupId, setGroupId] = useState('');
    const [targetType, setTargetType] = useState<AccessTargetType>(defaultTargetType);
    const [targetId, setTargetId] = useState(defaultTargetId);
    const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('18:00');
    const [validFrom, setValidFrom] = useState('');
    const [validTo, setValidTo] = useState('');
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateAccessRuleMutation();

    useEffect(() => {
        if (open) {
            setGroupId('');
            setTargetType(defaultTargetType);
            setTargetId(defaultTargetId);
            setSelectedDays([1, 2, 3, 4, 5]);
            setStartTime('08:00');
            setEndTime('18:00');
            setValidFrom('');
            setValidTo('');
            setError(null);
        }
    }, [open, defaultTargetType, defaultTargetId]);

    const targetOptions = useMemo(() => {
        if (targetType === AccessTargetType.Zone) {
            return zones.map((zone) => ({
                id: zone.id,
                label: `${zone.name} (${zone.code})`,
            }));
        }

        if (targetType === AccessTargetType.Room) {
            return rooms.map((room) => ({
                id: room.id,
                label: `${room.name} (${room.code})`,
            }));
        }

        return doors.map((door) => ({
            id: door.id,
            label: `${door.name} (${door.code})`,
        }));
    }, [targetType, zones, rooms, doors]);

    const handleTargetTypeChange = (value: AccessTargetType) => {
        setTargetType(value);

        if (value === AccessTargetType.Zone) {
            setTargetId(zones[0]?.id ?? '');
            return;
        }

        if (value === AccessTargetType.Room) {
            setTargetId(rooms[0]?.id ?? '');
            return;
        }

        setTargetId(doors[0]?.id ?? '');
    };

    const toggleDay = (day: number) => {
        setSelectedDays((current) =>
            current.includes(day)
                ? current.filter((item) => item !== day)
                : [...current, day].sort((a, b) => a - b)
        );
    };

    const handleSubmit = async () => {
        try {
            setError(null);

            if (!groupId || !targetId) {
                setError('Please select group and target.');
                return;
            }

            if (selectedDays.length === 0) {
                setError('Please select at least one day.');
                return;
            }

            if (startTime >= endTime) {
                setError('Start time must be earlier than end time.');
                return;
            }

            await createMutation.mutateAsync({
                groupId,
                targetType,
                targetId,
                windows: selectedDays.map((day) => ({
                    dayOfWeekIso: day,
                    startTime: `${startTime}:00`,
                    endTime: `${endTime}:00`,
                })),
                validFrom: validFrom ? new Date(validFrom).toISOString() : null,
                validTo: validTo ? new Date(validTo).toISOString() : null,
            });

            onClose();
        } catch {
            setError('Failed to create access rule. Please check the schedule and try again.');
        }
    };

    return (
        <Dialog open={open} onClose={createMutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Create access rule
                <IconButton onClick={onClose} disabled={createMutation.isPending}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        select
                        label="Student group"
                        value={groupId}
                        onChange={(event) => setGroupId(event.target.value)}
                        fullWidth
                    >
                        {groups.map((group) => (
                            <MenuItem key={group.id} value={group.id}>
                                {group.name} ({group.code})
                            </MenuItem>
                        ))}
                    </TextField>

                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '180px minmax(0, 1fr)' },
                            gap: 2,
                        }}
                    >
                        <TextField
                            select
                            label="Target type"
                            value={targetType}
                            onChange={(event) =>
                                handleTargetTypeChange(Number(event.target.value) as AccessTargetType)
                            }
                            fullWidth
                        >
                            {targetTypes.map((item) => (
                                <MenuItem key={item.value} value={item.value}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </TextField>

                        <TextField
                            select
                            label="Target"
                            value={targetId}
                            onChange={(event) => setTargetId(event.target.value)}
                            fullWidth
                            helperText="Door rules have the highest priority, then room, then zone."
                        >
                            {targetOptions.map((item) => (
                                <MenuItem key={item.id} value={item.id}>
                                    {item.label}
                                </MenuItem>
                            ))}
                        </TextField>
                    </Box>

                    <Stack spacing={1}>
                        <Typography variant="body2" color="text.secondary">
                            Days
                        </Typography>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {days.map((day) => (
                                <Chip
                                    key={day.value}
                                    label={day.label}
                                    color={selectedDays.includes(day.value) ? 'primary' : 'default'}
                                    variant={selectedDays.includes(day.value) ? 'filled' : 'outlined'}
                                    onClick={() => toggleDay(day.value)}
                                />
                            ))}
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            <Button size="small" onClick={() => setSelectedDays([1, 2, 3, 4, 5])}>
                                Weekdays
                            </Button>
                            <Button size="small" onClick={() => setSelectedDays([6, 7])}>
                                Weekend
                            </Button>
                            <Button size="small" onClick={() => setSelectedDays([1, 2, 3, 4, 5, 6, 7])}>
                                All week
                            </Button>
                            <Button size="small" color="inherit" onClick={() => setSelectedDays([])}>
                                Clear
                            </Button>
                        </Stack>
                    </Stack>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            label="Start time"
                            type="time"
                            value={startTime}
                            onChange={(event) => setStartTime(event.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />

                        <TextField
                            label="End time"
                            type="time"
                            value={endTime}
                            onChange={(event) => setEndTime(event.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                        />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                        <TextField
                            label="Valid from"
                            type="datetime-local"
                            value={validFrom}
                            onChange={(event) => setValidFrom(event.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            helperText="Optional"
                        />

                        <TextField
                            label="Valid to"
                            type="datetime-local"
                            value={validTo}
                            onChange={(event) => setValidTo(event.target.value)}
                            fullWidth
                            InputLabelProps={{ shrink: true }}
                            helperText="Optional"
                        />
                    </Box>
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={createMutation.isPending}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => void handleSubmit()}
                    disabled={
                        createMutation.isPending ||
                        !groupId ||
                        !targetId ||
                        selectedDays.length === 0 ||
                        !startTime ||
                        !endTime
                    }
                >
                    Save rule
                </Button>
            </DialogActions>
        </Dialog>
    );
}