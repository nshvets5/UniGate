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
import { useCreateDoorMutation } from './use-create-door-mutation';

type CreateDoorDialogProps = {
    open: boolean;
    zoneId: string;
    onClose: () => void;
};

export function CreateDoorDialog({
                                     open,
                                     zoneId,
                                     onClose,
                                 }: CreateDoorDialogProps) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateDoorMutation();

    useEffect(() => {
        if (!open) {
            setCode('');
            setName('');
            setDescription('');
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        try {
            setError(null);

            await createMutation.mutateAsync({
                zoneId,
                code: code.trim(),
                name: name.trim(),
                description: description.trim() || null,
            });

            onClose();
        } catch {
            setError('Failed to create door. Please check the input and try again.');
        }
    };

    const isSubmitDisabled =
        createMutation.isPending || !code.trim() || !name.trim();

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
                <Button onClick={onClose} disabled={createMutation.isPending}>Cancel</Button>
                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => void handleSubmit()}
                    disabled={isSubmitDisabled}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}