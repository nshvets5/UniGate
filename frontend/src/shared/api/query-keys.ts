export const queryKeys = {
    groups: {
        all: ['groups'] as const,
        list: (params: unknown) => ['groups', 'list', params] as const,
    },
    students: {
        all: ['students'] as const,
        list: (params: unknown) => ['students', 'list', params] as const,
    },
};