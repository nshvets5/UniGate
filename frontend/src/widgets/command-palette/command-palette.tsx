import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import {
    Box,
    Dialog,
    DialogContent,
    DialogTitle,
    InputAdornment,
    List,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    TextField,
    Typography,
} from '@mui/material';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type CommandItem = {
    title: string;
    description: string;
    path: string;
    icon: ReactNode;
    keywords: string[];
};

type Props = {
    open: boolean;
    onClose: () => void;
    commands: CommandItem[];
};

export function CommandPalette({ open, onClose, commands }: Props) {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');

    useEffect(() => {
        if (!open) {
            setQuery('');
        }
    }, [open]);

    const filteredCommands = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        if (!normalizedQuery) {
            return commands;
        }

        return commands.filter((command) => {
            const searchSource = [
                command.title,
                command.description,
                command.path,
                ...command.keywords,
            ]
                .join(' ')
                .toLowerCase();

            return searchSource.includes(normalizedQuery);
        });
    }, [commands, query]);

    const handleSelect = (path: string) => {
        navigate(path);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                <Typography variant="subtitle1">Command palette</Typography>
                <Typography variant="body2" color="text.secondary">
                    Search pages and navigate quickly across UniGate.
                </Typography>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 0 }}>
                <Box sx={{ p: 2 }}>
                    <TextField
                        autoFocus
                        fullWidth
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search commands..."
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchOutlinedIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>

                <List sx={{ px: 1, pb: 1 }}>
                    {filteredCommands.length === 0 ? (
                        <Box sx={{ px: 2, py: 4, textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                                No commands found.
                            </Typography>
                        </Box>
                    ) : (
                        filteredCommands.map((command) => (
                            <ListItemButton
                                key={command.path}
                                onClick={() => handleSelect(command.path)}
                                sx={{
                                    borderRadius: 2,
                                    mb: 0.5,
                                }}
                            >
                                <ListItemIcon>{command.icon}</ListItemIcon>

                                <ListItemText
                                    primary={command.title}
                                    secondary={command.description}
                                />
                            </ListItemButton>
                        ))
                    )}
                </List>
            </DialogContent>
        </Dialog>
    );
}