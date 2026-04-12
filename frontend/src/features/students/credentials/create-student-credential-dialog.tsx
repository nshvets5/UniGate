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
import { useCreateStudentCredentialMutation } from './use-create-student-credential-mutation';

type CreateStudentCredentialDialogProps = {
    open: boolean;
    studentId: string;
    onClose: () => void;
};

export function CreateStudentCredentialDialog({
                                                  open,
                                                  studentId,
                                                  onClose,
                                              }: CreateStudentCredentialDialogProps) {
    const [type, setType] = useState<'rfid' | 'qr' | 'manual'>('rfid');
    const [value, setValue] = useState('');
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateStudentCredentialMutation(studentId);

    useEffect(() => {
        if (!open) {
            setType('rfid');
            setValue('');
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        try {
            setError(null);

            await createMutation.mutateAsync({
                studentId,
                type,
                value: value.trim(),
            });

            onClose();
        } catch {
            setError('Failed to create credential. Please verify the input.');
        }
    };

    return (
        <Dialog
            open={open}
            onClose={createMutation.isPending ? undefined : onClose}
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
                Add credential
                <IconButton onClick={onClose} disabled={createMutation.isPending}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        select
                        label="Credential type"
                        value={type}
                        onChange={(event) =>
                            setType(event.target.value as 'rfid' | 'qr' | 'manual')
                        }
                        fullWidth
                    >
                        <MenuItem value="rfid">RFID</MenuItem>
                        <MenuItem value="qr">QR</MenuItem>
                        <MenuItem value="manual">Manual</MenuItem>
                    </TextField>

                    <TextField
                        label="Credential value"
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
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
                    disabled={createMutation.isPending || !value.trim()}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}