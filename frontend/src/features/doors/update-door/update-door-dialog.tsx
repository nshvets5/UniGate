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
import type { DoorDto } from '../../../entities/door/types';
import { useUpdateDoorMutation } from './use-update-door-mutation';

type UpdateDoorDialogProps = {
    open: boolean;
    door: DoorDto | null;
    onClose: () => void;
};

export function UpdateDoorDialog({
                                     open,
                                     door,
                                     onClose,
                                 }: UpdateDoorDialogProps) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useUpdateDoorMutation();

    useEffect(() => {
        if (open && door) {
            setCode(door.code);
            setName(door.name);
            setDescription(door.description ?? '');
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
                code: code.trim(),
                name: name.trim(),
                description: description.trim() || null,
            });

            onClose();
        } catch {
            setError('Failed to update door. Please check the input and try again.');
        }
    };

    const isSubmitDisabled =
        updateMutation.isPending || !door || !code.trim() || !name.trim();

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

                    <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
                    <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />
                    <TextField
                        label="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
                    />
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={updateMutation.isPending}>Cancel</Button>
                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitDisabled}
                >
                    Save changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}