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
import { useCreateAccessRuleMutation } from './use-create-access-rule-mutation';

type CreateAccessRuleDialogProps = {
    open: boolean;
    zoneId: string;
    onClose: () => void;
};

export function CreateAccessRuleDialog({
                                           open,
                                           zoneId,
                                           onClose,
                                       }: CreateAccessRuleDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateAccessRuleMutation();

    useEffect(() => {
        if (!open) {
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
                name: name.trim(),
                description: description.trim() || null,
            });

            onClose();
        } catch {
            setError('Failed to create access rule. Please check the input and try again.');
        }
    };

    const isSubmitDisabled = createMutation.isPending || !name.trim();

    return (
        <Dialog
            open={open}
            onClose={createMutation.isPending ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
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
                <Button onClick={onClose} disabled={createMutation.isPending}>
                    Cancel
                </Button>

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