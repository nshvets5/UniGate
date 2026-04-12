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
import type { StudentDto } from '../../../entities/student/types';
import { useChangeStudentGroupMutation } from './use-change-student-group-mutation';

type ChangeStudentGroupDialogProps = {
    open: boolean;
    student: StudentDto | null;
    groups: GroupDto[];
    onClose: () => void;
};

export function ChangeStudentGroupDialog({
                                             open,
                                             student,
                                             groups,
                                             onClose,
                                         }: ChangeStudentGroupDialogProps) {
    const [groupId, setGroupId] = useState('');
    const [error, setError] = useState<string | null>(null);

    const changeGroupMutation = useChangeStudentGroupMutation();

    useEffect(() => {
        if (open && student) {
            setGroupId(student.groupId);
            setError(null);
        }
    }, [open, student]);

    const handleSubmit = async () => {
        if (!student) return;

        try {
            setError(null);

            await changeGroupMutation.mutateAsync({
                id: student.id,
                groupId,
            });

            onClose();
        } catch {
            setError('Failed to change student group. Please try again.');
        }
    };

    const isSubmitDisabled =
        changeGroupMutation.isPending || !student || !groupId;

    return (
        <Dialog
            open={open}
            onClose={changeGroupMutation.isPending ? undefined : onClose}
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
                Change student group
                <IconButton onClick={onClose} disabled={changeGroupMutation.isPending}>
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
                </Stack>
            </DialogContent>

            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} disabled={changeGroupMutation.isPending}>
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