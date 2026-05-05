import { Stack, Typography } from '@mui/material';
import { useReadersQuery } from '../features/readers/list-readers/use-readers-query';
import { PageContainer } from '../shared/ui/page-container';
import { PageHeader } from '../shared/ui/page-header';
import { LoadingState } from '../shared/ui/loading-state';
import { ErrorState } from '../shared/ui/error-state';

export function ReadersPage() {
    const query = useReadersQuery({
        page: 1,
        pageSize: 20,
    });

    return (
        <PageContainer>
            <PageHeader
                title="Reader devices"
                subtitle="Manage physical access control readers and monitor their status."
            />

            {query.isLoading ? (
                <LoadingState title="Loading readers" />
            ) : query.isError ? (
                <ErrorState
                    title="Failed to load readers"
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