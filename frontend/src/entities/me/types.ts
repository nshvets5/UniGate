export type CurrentUserDto = {
    subject: string;
    email: string | null;
    displayName: string | null;
    roles: string[];
};