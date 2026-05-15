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
import type { RoomDto } from '../../../entities/room/api';
import { useCreateDoorMutation } from './use-create-door-mutation';

type CreateDoorDialogProps = {
    open: boolean;
    zoneId: string;
    rooms: RoomDto[];
    onClose: () => void;
};

export function CreateDoorDialog({
                                     open,
                                     zoneId,
                                     rooms,
                                     onClose,
                                 }: CreateDoorDialogProps) {
    const [roomId, setRoomId] = useState('');
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateDoorMutation();

    useEffect(() => {
        if (!open) {
            setRoomId('');
            setCode('');
            setName('');
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        try {
            setError(null);

            await createMutation.mutateAsync({
                zoneId,
                roomId: roomId || null,
                code: code.trim(),
                name: name.trim(),
            });

            onClose();
        } catch {
            setError('Failed to create door. Please check the input and try again.');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={createMutation.isPending ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Create door
                <IconButton onClick={onClose} disabled={createMutation.isPending}>
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
                <Button onClick={onClose} disabled={createMutation.isPending}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => void handleSubmit()}
                    disabled={createMutation.isPending || !code.trim() || !name.trim()}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}