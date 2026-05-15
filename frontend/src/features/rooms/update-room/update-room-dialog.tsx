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
    Stack,
    TextField,
} from '@mui/material';
import { useEffect, useState } from 'react';
import type { RoomDto } from '../../../entities/room/api';
import { useUpdateRoomMutation } from './use-update-room-mutation';

type Props = {
    open: boolean;
    room: RoomDto | null;
    onClose: () => void;
};

export function UpdateRoomDialog({ open, room, onClose }: Props) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mutation = useUpdateRoomMutation();

    useEffect(() => {
        if (open && room) {
            setCode(room.code);
            setName(room.name);
            setError(null);
        }
    }, [open, room]);

    const handleSubmit = async () => {
        if (!room) return;

        try {
            setError(null);

            await mutation.mutateAsync({
                id: room.id,
                code: code.trim(),
                name: name.trim(),
                zoneId: room.zoneId,
            });

            onClose();
        } catch {
            setError('Failed to update room.');
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
                Edit room
                <IconButton onClick={onClose} disabled={mutation.isPending}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        label="Room code"
                        value={code}
                        onChange={(event) => setCode(event.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Room name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        fullWidth
                    />
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
                    disabled={mutation.isPending || !room || !code.trim() || !name.trim()}
                >
                    Save changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}