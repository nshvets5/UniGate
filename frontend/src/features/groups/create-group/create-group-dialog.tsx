import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import SaveOutlinedIcon from '@mui/icons-material/SaveOutlined';
import {
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

type CreateGroupPayload = {
    code: string;
    name: string;
    admissionYear: number;
};

type CreateGroupDialogProps = {
    open: boolean;
    onClose: () => void;
    onCreate: (payload: CreateGroupPayload) => void;
};

export function CreateGroupDialog({
                                      open,
                                      onClose,
                                      onCreate,
                                  }: CreateGroupDialogProps) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [admissionYear, setAdmissionYear] = useState('');

    useEffect(() => {
        if (!open) {
            setCode('');
            setName('');
            setAdmissionYear('');
        }
    }, [open]);

    const handleSubmit = () => {
        onCreate({
            code: code.trim(),
            name: name.trim(),
            admissionYear: Number(admissionYear),
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                Create group
                <IconButton onClick={onClose}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
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
                <Button onClick={onClose}>Cancel</Button>

                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={handleSubmit}
                    disabled={!code.trim() || !name.trim() || !admissionYear.trim()}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}