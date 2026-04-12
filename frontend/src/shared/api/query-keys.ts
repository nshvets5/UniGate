export const queryKeys = {
    groups: {
        all: ['groups'] as const,
        list: (params: unknown) => ['groups', 'list', params] as const,
    },
    students: {
        all: ['students'] as const,
        list: (params: unknown) => ['students', 'list', params] as const,
        detail: (id: string) => ['students', 'detail', id] as const,
        credentials: (id: string) => ['students', 'credentials', id] as const,
    },
    zones: {
        all: ['zones'] as const,
        list: (params: unknown) => ['zones', 'list', params] as const,
    },
};