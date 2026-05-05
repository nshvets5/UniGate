import { Stack, Typography } from '@mui/material';
import { useAttemptsQuery } from '../features/attempts/list-attempts/use-attempts-query';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { LoadingState } from '../shared/ui/loading-state';
import { ErrorState } from '../shared/ui/error-state';

export function AttemptsPage() {
    const query = useAttemptsQuery({
        page: 1,
        pageSize: 20,
    });

    return (
        <PageContainer>
            <PageHeader
                title="Access attempts"
                subtitle="Real-time access decisions and security events."
            />

            {query.isLoading ? (
                <LoadingState title="Loading attempts" />
            ) : query.isError ? (
                <ErrorState
                    title="Failed to load attempts"
                    onRetry={() => query.refetch()}
                />
            ) : (
                <Stack spacing={2}>
                    <Typography variant="body2">
                        Total: {query.data?.totalCount}
                    </Typography>
                </Stack>
            )}
        </PageContainer>
    );
}