export const appRoles = {
    admin: 'Admin',
} as const;

export function hasRole(userRoles: string[] | undefined, role: string) {
    return Boolean(userRoles?.some((userRole) => userRole === role));
}

export function hasAnyRole(userRoles: string[] | undefined, roles: string[]) {
    return roles.some((role) => hasRole(userRoles, role));
}