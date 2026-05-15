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
import { useCreateRoomMutation } from './use-create-room-mutation';

type Props = {
    open: boolean;
    zoneId: string;
    onClose: () => void;
};

export function CreateRoomDialog({
                                     open,
                                     zoneId,
                                     onClose,
                                 }: Props) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState<string | null>(null);

    const mutation = useCreateRoomMutation();

    useEffect(() => {
        if (!open) {
            setCode('');
            setName('');
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        try {
            setError(null);

            await mutation.mutateAsync({
                code: code.trim(),
                name: name.trim(),
                zoneId,
            });

            onClose();
        } catch {
            setError('Failed to create room.');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={mutation.isPending ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                Create room

                <IconButton
                    onClick={onClose}
                    disabled={mutation.isPending}
                >
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? (
                        <Alert severity="error">{error}</Alert>
                    ) : null}

                    <TextField
                        label="Room code"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Room name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        fullWidth
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button
                    onClick={onClose}
                    disabled={mutation.isPending}
                >
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => void handleSubmit()}
                    disabled={
                        mutation.isPending ||
                        !code.trim() ||
                        !name.trim()
                    }
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}