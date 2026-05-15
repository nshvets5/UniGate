import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
    Alert,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    MenuItem,
    Stack,
    TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { DoorDto } from '../../../entities/door/types';
import type { RoomDto } from '../../../entities/room/api';
import { useUpdateDoorMutation } from './use-update-door-mutation';

type UpdateDoorDialogProps = {
    open: boolean;
    door: DoorDto | null;
    rooms: RoomDto[];
    onClose: () => void;
};

export function UpdateDoorDialog({
                                     open,
                                     door,
                                     rooms,
                                     onClose,
                                 }: UpdateDoorDialogProps) {
    const [roomId, setRoomId] = useState('');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useUpdateDoorMutation();

    useEffect(() => {
        if (open && door) {
            setRoomId(door.roomId ?? '');
            setCode(door.code);
            setName(door.name);
            setError(null);
        }
    }, [open, door]);

    const handleSubmit = async () => {
        if (!door) return;

        try {
            setError(null);

            await updateMutation.mutateAsync({
                id: door.id,
                zoneId: door.zoneId,
                roomId: roomId || null,
                code: code.trim(),
                name: name.trim(),
            });

            onClose();
        } catch {
            setError('Failed to update door. Please check the input and try again.');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={updateMutation.isPending ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Edit door
                <IconButton onClick={onClose} disabled={updateMutation.isPending}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        select
                        label="Room"
                        value={roomId}
                        onChange={(event) => setRoomId(event.target.value)}
                        fullWidth
                        helperText="Optional. Leave empty if this door controls access to the entire zone."
                    >
                        <MenuItem value="">Zone-level door</MenuItem>
                        {rooms.map((room) => (
                            <MenuItem key={room.id} value={room.id}>
                                {room.name} ({room.code})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Code"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        fullWidth
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={updateMutation.isPending}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => void handleSubmit()}
                    disabled={updateMutation.isPending || !door || !code.trim() || !name.trim()}
                >
                    Save changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}