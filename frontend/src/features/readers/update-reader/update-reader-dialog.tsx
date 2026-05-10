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
import type { ReaderDto, ReaderType } from '../../../entities/reader/api';
import { useUpdateReaderMutation } from './use-update-reader-mutation';

type Props = {
    open: boolean;
    reader: ReaderDto | null;
    doors: DoorDto[];
    onClose: () => void;
};

const readerTypes: { value: ReaderType; label: string }[] = [
    { value: 1, label: 'RFID' },
    { value: 2, label: 'QR' },
    { value: 3, label: 'Mixed' },
    { value: 4, label: 'Emulator' },
];

export function UpdateReaderDialog({ open, reader, doors, onClose }: Props) {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [doorId, setDoorId] = useState('');
    const [type, setType] = useState<ReaderType>(4);
    const [error, setError] = useState<string | null>(null);

    const updateMutation = useUpdateReaderMutation();

    useEffect(() => {
        if (open && reader) {
            setCode(reader.code);
            setName(reader.name);
            setDoorId(reader.doorId);
            setType(reader.type);
            setError(null);
        }
    }, [open, reader]);

    const handleSubmit = async () => {
        if (!reader) return;

        try {
            setError(null);

            await updateMutation.mutateAsync({
                id: reader.id,
                code: code.trim(),
                name: name.trim(),
                doorId,
                type,
            });

            onClose();
        } catch {
            setError('Failed to update reader. Please check the input and try again.');
        }
    };

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
                Edit reader
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
                        select
                        label="Door"
                        value={doorId}
                        onChange={(event) => setDoorId(event.target.value)}
                        fullWidth
                    >
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
                        onChange={(event) => setType(Number(event.target.value) as ReaderType)}
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
                <Button onClick={onClose} disabled={updateMutation.isPending}>
                    Cancel
                </Button>

                <Button
                    variant="contained"
                    startIcon={<SaveOutlinedIcon />}
                    onClick={() => void handleSubmit()}
                    disabled={
                        updateMutation.isPending ||
                        !reader ||
                        !code.trim() ||
                        !name.trim() ||
                        !doorId
                    }
                >
                    Save changes
                </Button>
            </DialogActions>
        </Dialog>
    );
}