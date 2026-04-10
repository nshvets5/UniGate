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
import { useCreateGroupMutation } from './use-create-group-mutation';

type CreateGroupDialogProps = {
    open: boolean;
    onClose: () => void;
};

export function CreateGroupDialog({
                                      open,
                                      onClose,
                                  }: CreateGroupDialogProps) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [admissionYear, setAdmissionYear] = useState('');
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateGroupMutation();

    useEffect(() => {
        if (!open) {
            setCode('');
            setName('');
            setAdmissionYear('');
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        try {
            setError(null);

            await createMutation.mutateAsync({
                code: code.trim(),
                name: name.trim(),
                admissionYear: Number(admissionYear),
            });

            onClose();
        } catch {
            setError('Failed to create group. Please check the input and try again.');
        }
    };

    const isSubmitDisabled =
        createMutation.isPending ||
        !code.trim() ||
        !name.trim() ||
        !admissionYear.trim();

    return (
        <Dialog open={open} onClose={createMutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                Create group
                <IconButton onClick={onClose} disabled={createMutation.isPending}>
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
                        label="Admission year"
                        value={admissionYear}
                        onChange={(event) => setAdmissionYear(event.target.value)}
                        fullWidth
                        type="number"
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