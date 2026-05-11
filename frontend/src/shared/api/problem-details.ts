type ProblemDetails = {
    title?: string;
    detail?: string;
    status?: number;
    errors?: Record<string, string[]>;
};

export function getApiErrorMessage(data: unknown, fallback = 'Request failed') {
    if (!data || typeof data !== 'object') {
        return fallback;
    }

    const problem = data as ProblemDetails;

    if (problem.errors) {
        const firstError = Object.values(problem.errors)[0]?.[0];

        if (firstError) {
            return firstError;
        }
    }

    return problem.detail || problem.title || fallback;
}