export const queryKeys = {
    groups: {
        all: ['groups'] as const,
        list: (params: unknown) => ['groups', 'list', params] as const,
    },
};