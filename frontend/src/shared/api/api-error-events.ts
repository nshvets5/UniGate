export type ApiErrorEvent = {
    message: string;
    status?: number;
};

type Listener = (event: ApiErrorEvent) => void;

const listeners = new Set<Listener>();

export function subscribeToApiErrors(listener: Listener) {
    listeners.add(listener);

    return () => {
        listeners.delete(listener);
    };
}

export function publishApiError(event: ApiErrorEvent) {
    listeners.forEach((listener) => listener(event));
}