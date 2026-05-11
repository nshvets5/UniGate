import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Divider,
    Stack,
    Typography,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { useState } from 'react';
import { useMeSecurityQuery } from '../features/profile/security/use-me-security-query';
import { useResendVerificationEmailMutation } from '../features/profile/security/use-resend-verification-email-mutation';
import { useSendPasswordResetEmailMutation } from '../features/profile/security/use-send-password-reset-email-mutation';
import { CodeBadge } from '../shared/ui/code-badge';
import { ErrorState } from '../shared/ui/error-state';
import { LoadingState } from '../shared/ui/loading-state';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { SectionCard } from '../shared/ui/section-card';
import { StatusChip } from '../shared/ui/status-chip';

export function SecurityProfilePage() {
    const theme = useTheme();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const securityQuery = useMeSecurityQuery();
    const resendVerificationMutation = useResendVerificationEmailMutation();
    const passwordResetMutation = useSendPasswordResetEmailMutation();

    const security = securityQuery.data;

    const handleResendVerification = async () => {
        setSuccessMessage(null);
        await resendVerificationMutation.mutateAsync();
        setSuccessMessage('Verification email has been requested successfully.');
    };

    const handlePasswordReset = async () => {
        setSuccessMessage(null);
        await passwordResetMutation.mutateAsync();
        setSuccessMessage('Password reset email has been requested successfully.');
    };

    return (
        <PageContainer>
            <PageHeader
                title="Security profile"
                subtitle="Review your identity provider account status and available self-service security actions."
            />

            {successMessage ? (
                <Alert severity="success" onClose={() => setSuccessMessage(null)}>
                    {successMessage}
                </Alert>
            ) : null}

            {resendVerificationMutation.isError || passwordResetMutation.isError ? (
                <Alert severity="error">
                    Security action failed. Please try again later.
                </Alert>
            ) : null}

            {securityQuery.isLoading ? (
                <LoadingState
                    title="Loading security profile"
                    description="Please wait while account security information is being loaded."
                />
            ) : securityQuery.isError || !security ? (
                <ErrorState
                    title="Failed to load security profile"
                    description="Security profile could not be loaded from the server."
                    onRetry={() => void securityQuery.refetch()}
                />
            ) : (
                <>
                    <SectionCard>
                        <Stack spacing={2.5}>
                            <Stack
                                direction={{ xs: 'column', md: 'row' }}
                                justifyContent="space-between"
                                gap={2}
                            >
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Box
                                        sx={{
                                            width: 58,
                                            height: 58,
                                            borderRadius: 4,
                                            display: 'grid',
                                            placeItems: 'center',
                                            bgcolor: security.emailVerified
                                                ? alpha(theme.palette.success.main, 0.12)
                                                : alpha(theme.palette.warning.main, 0.12),
                                            color: security.emailVerified ? 'success.main' : 'warning.main',
                                        }}
                                    >
                                        <ShieldOutlinedIcon />
                                    </Box>

                                    <Stack spacing={0.75}>
                                        <Typography variant="h6">
                                            {security.emailVerified
                                                ? 'Account email is verified'
                                                : 'Account email is not verified'}
                                        </Typography>

                                        <Typography variant="body2" color="text.secondary">
                                            Authentication is handled by {security.provider}.
                                        </Typography>
                                    </Stack>
                                </Stack>

                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <StatusChip
                                        label={security.isAuthenticated ? 'Authenticated' : 'Anonymous'}
                                        variant={security.isAuthenticated ? 'success' : 'warning'}
                                    />

                                    <StatusChip
                                        label={security.emailVerified ? 'Email verified' : 'Email not verified'}
                                        variant={security.emailVerified ? 'success' : 'warning'}
                                    />
                                </Stack>
                            </Stack>

                            <Divider />

                            <Box
                                sx={{
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '180px minmax(0, 1fr)' },
                                    gap: 1.5,
                                }}
                            >
                                <Typography variant="body2" color="text.secondary">
                                    Email
                                </Typography>
                                <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                    {security.email}
                                </Typography>

                                <Typography variant="body2" color="text.secondary">
                                    Provider
                                </Typography>
                                <CodeBadge value={security.provider} />

                                <Typography variant="body2" color="text.secondary">
                                    Subject
                                </Typography>
                                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                                    {security.subject}
                                </Typography>
                            </Box>
                        </Stack>
                    </SectionCard>

                    <SectionCard sx={{ p: 0, overflow: 'hidden' }}>
                        <Box sx={{ p: 3 }}>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2.5,
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                    }}
                                >
                                    <LockOutlinedIcon />
                                </Box>

                                <Stack>
                                    <Typography variant="subtitle1">Self-service actions</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Trigger identity provider actions for your own account.
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>

                        <Divider />

                        <Stack spacing={0} divider={<Divider />}>
                            <Box
                                sx={{
                                    p: 3,
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '44px minmax(0, 1fr) auto' },
                                    gap: 2,
                                    alignItems: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2.5,
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: alpha(theme.palette.info.main, 0.12),
                                        color: 'info.main',
                                    }}
                                >
                                    <EmailOutlinedIcon />
                                </Box>

                                <Stack spacing={0.5}>
                                    <Typography variant="subtitle2">Resend verification email</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Request a new email verification message through Keycloak.
                                    </Typography>
                                </Stack>

                                <Button
                                    variant="outlined"
                                    startIcon={
                                        resendVerificationMutation.isPending ? (
                                            <CircularProgress size={16} />
                                        ) : (
                                            <VerifiedUserOutlinedIcon />
                                        )
                                    }
                                    onClick={() => void handleResendVerification()}
                                    disabled={
                                        resendVerificationMutation.isPending ||
                                        !security.availableActions.canResendVerificationEmail
                                    }
                                >
                                    Resend
                                </Button>
                            </Box>

                            <Box
                                sx={{
                                    p: 3,
                                    display: 'grid',
                                    gridTemplateColumns: { xs: '1fr', md: '44px minmax(0, 1fr) auto' },
                                    gap: 2,
                                    alignItems: 'center',
                                }}
                            >
                                <Box
                                    sx={{
                                        width: 42,
                                        height: 42,
                                        borderRadius: 2.5,
                                        display: 'grid',
                                        placeItems: 'center',
                                        bgcolor: alpha(theme.palette.warning.main, 0.12),
                                        color: 'warning.main',
                                    }}
                                >
                                    <KeyOutlinedIcon />
                                </Box>

                                <Stack spacing={0.5}>
                                    <Typography variant="subtitle2">Send password reset email</Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        Request a password reset email for your identity provider account.
                                    </Typography>
                                </Stack>

                                <Button
                                    variant="outlined"
                                    color="warning"
                                    startIcon={
                                        passwordResetMutation.isPending ? (
                                            <CircularProgress size={16} />
                                        ) : (
                                            <KeyOutlinedIcon />
                                        )
                                    }
                                    onClick={() => void handlePasswordReset()}
                                    disabled={
                                        passwordResetMutation.isPending ||
                                        !security.availableActions.canSendPasswordResetEmail
                                    }
                                >
                                    Send reset
                                </Button>
                            </Box>
                        </Stack>
                    </SectionCard>
                </>
            )}
        </PageContainer>
    );
}