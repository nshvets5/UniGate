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
import type { GroupDto } from '../../../entities/group/types';
import { useUpdateGroupMutation } from './use-update-group-mutation';

type UpdateGroupDialogProps = {
    open: boolean;
    group: GroupDto | null;
    onClose: () => void;
};

export function UpdateGroupDialog({
                                      open,
                                      group,
                                      onClose,
                                  }: UpdateGroupDialogProps) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [admissionYear, setAdmissionYear] = useState('');
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useUpdateGroupMutation();

    useEffect(() => {
        if (open && group) {
            setCode(group.code);
            setName(group.name);
            setAdmissionYear(String(group.admissionYear));
            setError(null);
        }
    }, [open, group]);

    const handleSubmit = async () => {
        if (!group) return;

        try {
            setError(null);

            await updateMutation.mutateAsync({
                id: group.id,
                code: code.trim(),
                name: name.trim(),
                admissionYear: Number(admissionYear),
            });

            onClose();
        } catch {
            setError('Failed to update group. Please check the input and try again.');
        }
    };

    const isSubmitDisabled =
        updateMutation.isPending ||
        !group ||
        !code.trim() ||
        !name.trim() ||
        !admissionYear.trim();

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
                Edit group
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
                        label="Admission year"
                        value={admissionYear}
                        onChange={(event) => setAdmissionYear(event.target.value)}
                        fullWidth
                        type="number"
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