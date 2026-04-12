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
import type { StudentDto } from '../../../entities/student/types';
import { useUpdateStudentMutation } from './use-update-student-mutation';

type UpdateStudentDialogProps = {
    open: boolean;
    student: StudentDto | null;
    onClose: () => void;
};

export function UpdateStudentDialog({
                                        open,
                                        student,
                                        onClose,
                                    }: UpdateStudentDialogProps) {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useUpdateStudentMutation();

    useEffect(() => {
        if (open && student) {
            setFirstName(student.firstName);
            setLastName(student.lastName);
            setMiddleName(student.middleName ?? '');
            setEmail(student.email);
            setError(null);
        }
    }, [open, student]);

    const handleSubmit = async () => {
        if (!student) return;

        try {
            setError(null);

            await updateMutation.mutateAsync({
                id: student.id,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                middleName: middleName.trim() || null,
                email: email.trim(),
            });

            onClose();
        } catch {
            setError('Failed to update student. Please check the input and try again.');
        }
    };

    const isSubmitDisabled =
        updateMutation.isPending ||
        !student ||
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim();

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
                Edit student
                <IconButton onClick={onClose} disabled={updateMutation.isPending}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        label="First name"
                        value={firstName}
                        onChange={(event) => setFirstName(event.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Last name"
                        value={lastName}
                        onChange={(event) => setLastName(event.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Middle name"
                        value={middleName}
                        onChange={(event) => setMiddleName(event.target.value)}
                        fullWidth
                    />

                    <TextField
                        label="Email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        fullWidth
                        type="email"
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