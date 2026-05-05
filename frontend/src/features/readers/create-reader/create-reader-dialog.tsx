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
import type { DoorDto } from '../../../entities/door/types';
import type { ReaderType } from '../../../entities/reader/api';
import { useCreateReaderMutation } from './use-create-reader-mutation';

type Props = {
    open: boolean;
    doors: DoorDto[];
    onCreated: (apiKey: string) => void;
    onClose: () => void;
};

const readerTypes: { value: ReaderType; label: string }[] = [
    { value: 1, label: 'RFID' },
    { value: 2, label: 'QR' },
    { value: 3, label: 'Mixed' },
    { value: 4, label: 'Emulator' },
];

export function CreateReaderDialog({ open, doors, onCreated, onClose }: Props) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [doorId, setDoorId] = useState('');
    const [type, setType] = useState<ReaderType>(4);
    const [error, setError] = useState<string | null>(null);

    const createMutation = useCreateReaderMutation();

    useEffect(() => {
        if (!open) {
            setCode('');
            setName('');
            setDoorId('');
            setType(4);
            setError(null);
        }
    }, [open]);

    const handleSubmit = async () => {
        try {
            setError(null);

            const result = await createMutation.mutateAsync({
                code: code.trim(),
                name: name.trim(),
                doorId,
                type,
            });

            onCreated(result.apiKey);
            onClose();
        } catch {
            setError('Failed to create reader. Please check the input and try again.');
        }
    };

    return (
        <Dialog open={open} onClose={createMutation.isPending ? undefined : onClose} fullWidth maxWidth="sm">
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                Create reader
                <IconButton onClick={onClose} disabled={createMutation.isPending}>
                    <CloseOutlinedIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <Stack spacing={2.5} sx={{ pt: 1 }}>
                    {error ? <Alert severity="error">{error}</Alert> : null}

                    <TextField label="Code" value={code} onChange={(e) => setCode(e.target.value)} fullWidth />
                    <TextField label="Name" value={name} onChange={(e) => setName(e.target.value)} fullWidth />

                    <TextField select label="Door" value={doorId} onChange={(e) => setDoorId(e.target.value)} fullWidth>
                        {doors.map((door) => (
                            <MenuItem key={door.id} value={door.id}>
                                {door.name} ({door.code})
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        label="Reader type"
                        value={type}
                        onChange={(e) => setType(Number(e.target.value) as ReaderType)}
                        fullWidth
                    >
                        {readerTypes.map((readerType) => (
                            <MenuItem key={readerType.value} value={readerType.value}>
                                {readerType.label}
                            </MenuItem>
                        ))}
                    </TextField>
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
                    disabled={createMutation.isPending || !code.trim() || !name.trim() || !doorId}
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
}