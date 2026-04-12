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
import type { ZoneDto } from '../../../entities/zone/types';
import { useUpdateZoneMutation } from './use-update-zone-mutation';

type UpdateZoneDialogProps = {
    open: boolean;
    zone: ZoneDto | null;
    onClose: () => void;
};

export function UpdateZoneDialog({
                                     open,
                                     zone,
                                     onClose,
                                 }: UpdateZoneDialogProps) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useUpdateZoneMutation();

    useEffect(() => {
        if (open && zone) {
            setCode(zone.code);
            setName(zone.name);
            setDescription(zone.description ?? '');
            setError(null);
        }
    }, [open, zone]);

    const handleSubmit = async () => {
        if (!zone) return;

        try {
            setError(null);

            await updateMutation.mutateAsync({
                id: zone.id,
                code: code.trim(),
                name: name.trim(),
                description: description.trim() || null,
            });

            onClose();
        } catch {
            setError('Failed to update zone. Please check the input and try again.');
        }
    };

    const isSubmitDisabled =
        updateMutation.isPending || !zone || !code.trim() || !name.trim();

    return (
        <Dialog
            open={open}
            onClose={updateMutation.isPending ? undefined : onClose}
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
                Edit zone
                <IconButton onClick={onClose} disabled={updateMutation.isPending}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

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

                    <TextField
                        label="Description"
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        fullWidth
                        multiline
                        minRows={3}
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
                    disabled={isSubmitDisabled}
                >
                    Save changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}