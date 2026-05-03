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
import type { AccessRuleDto } from '../../../entities/access-rule/types';
import { useUpdateAccessRuleMutation } from './use-update-access-rule-mutation';

type UpdateAccessRuleDialogProps = {
    open: boolean;
    rule: AccessRuleDto | null;
    onClose: () => void;
};

export function UpdateAccessRuleDialog({
                                           open,
                                           rule,
                                           onClose,
                                       }: UpdateAccessRuleDialogProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useUpdateAccessRuleMutation();

    useEffect(() => {
        if (open && rule) {
            setName(rule.name);
            setDescription(rule.description ?? '');
            setError(null);
        }
    }, [open, rule]);

    const handleSubmit = async () => {
        if (!rule) return;

        try {
            setError(null);

            await updateMutation.mutateAsync({
                id: rule.id,
                zoneId: rule.zoneId,
                name: name.trim(),
                description: description.trim() || null,
            });

            onClose();
        } catch {
            setError('Failed to update access rule. Please check the input and try again.');
        }
    };

    const isSubmitDisabled = updateMutation.isPending || !rule || !name.trim();

    return (
        <Dialog
            open={open}
            onClose={updateMutation.isPending ? undefined : onClose}
            fullWidth
            maxWidth="sm"
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Edit access rule
                <IconButton onClick={onClose} disabled={updateMutation.isPending}>
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