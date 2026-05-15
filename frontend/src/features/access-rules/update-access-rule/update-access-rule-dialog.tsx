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
import {
    AccessTargetType,
    type AccessRuleDto,
} from '../../../entities/access-rule/types';
import type { DoorDto } from '../../../entities/door/types';
import type { RoomDto } from '../../../entities/room/api';
import type { ZoneDto } from '../../../entities/zone/types';
import { useUpdateAccessRuleScheduleMutation } from './use-update-access-rule-schedule-mutation';

type Props = {
    open: boolean;
    rule: AccessRuleDto | null;
    zones: ZoneDto[];
    rooms: RoomDto[];
    doors: DoorDto[];
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

function toTimeInput(value?: string | null) {
    if (!value) return '08:00';
    return value.slice(0, 5);
}

function toDateTimeLocal(value?: string | null) {
    if (!value) return '';
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '';

    const offset = date.getTimezoneOffset();
    const local = new Date(date.getTime() - offset * 60_000);

    return local.toISOString().slice(0, 16);
}

export function UpdateAccessRuleDialog({
                                           open,
                                           rule,
                                           zones,
                                           rooms,
                                           doors,
                                           onClose,
                                       }: Props) {
    const [targetType, setTargetType] = useState<AccessTargetType>(AccessTargetType.Zone);
    const [targetId, setTargetId] = useState('');
    const [selectedDays, setSelectedDays] = useState<number[]>([]);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('18:00');
    const [validFrom, setValidFrom] = useState('');
    const [validTo, setValidTo] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mutation = useUpdateAccessRuleScheduleMutation();

    useEffect(() => {
        if (open && rule) {
            const firstWindow = rule.windows[0];

            setTargetType(rule.targetType);
            setTargetId(rule.targetId);
            setSelectedDays(rule.windows.map((window) => window.dayOfWeekIso));
            setStartTime(toTimeInput(firstWindow?.startTime));
            setEndTime(toTimeInput(firstWindow?.endTime));
            setValidFrom(toDateTimeLocal(rule.validFrom));
            setValidTo(toDateTimeLocal(rule.validTo));
            setError(null);
        }
    }, [open, rule]);

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
        if (!rule) return;

        try {
            setError(null);

            if (!targetId) {
                setError('Please select a target.');
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

            await mutation.mutateAsync({
                id: rule.id,
                payload: {
                    targetType,
                    targetId,
                    windows: selectedDays.map((day) => ({
                        dayOfWeekIso: day,
                        startTime: `${startTime}:00`,
                        endTime: `${endTime}:00`,
                    })),
                    validFrom: validFrom ? new Date(validFrom).toISOString() : null,
                    validTo: validTo ? new Date(validTo).toISOString() : null,
                },
            });

            onClose();
        } catch {
            setError('Failed to update access rule. Please check the schedule and try again.');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={mutation.isPending ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Edit access rule
                <IconButton onClick={onClose} disabled={mutation.isPending}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

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
                <Button onClick={onClose} disabled={mutation.isPending}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => void handleSubmit()}
                    disabled={
                        mutation.isPending ||
                        !rule ||
                        !targetId ||
                        selectedDays.length === 0 ||
                        !startTime ||
                        !endTime
                    }
                >
                    Save changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}