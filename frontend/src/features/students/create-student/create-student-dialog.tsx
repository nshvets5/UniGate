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
import type { GroupDto } from '../../../entities/group/types';
import { useCreateStudentMutation } from './use-create-student-mutation';

type CreateStudentDialogProps = {
    open: boolean;
    onClose: () => void;
    groups: GroupDto[];
};

export function CreateStudentDialog({
                                        open,
                                        onClose,
                                        groups,
                                    }: CreateStudentDialogProps) {
    const [groupId, setGroupId] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleName, setMiddleName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateStudentMutation();

    useEffect(() => {
        if (!open) {
            setGroupId('');
            setFirstName('');
            setLastName('');
            setMiddleName('');
            setEmail('');
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        try {
            setError(null);

            await createMutation.mutateAsync({
                groupId,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                middleName: middleName.trim() || null,
                email: email.trim(),
            });

            onClose();
        } catch {
            setError('Failed to create student. Please check the input and try again.');
        }
    };

    const isSubmitDisabled =
        createMutation.isPending ||
        !groupId ||
        !firstName.trim() ||
        !lastName.trim() ||
        !email.trim();

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
                Create student
                <IconButton onClick={onClose} disabled={createMutation.isPending}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField
                        select
                        label="Group"
                        value={groupId}
                        onChange={(event) => setGroupId(event.target.value)}
                        fullWidth
                    >
                        {groups.map((group) => (
                            <MenuItem key={group.id} value={group.id}>
                                {group.name} ({group.code})
                            </MenuItem>
                        ))}
                    </TextField>

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