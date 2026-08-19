/**
 * Pont entre le monde "hors React" (interceptors axios, utils...) et le
 * LoadingProvider. Les interceptors ne peuvent pas appeler useLoading()
 * directement (ce n'est pas un composant), donc ils passent par ce service.
 * Le LoadingProvider s'enregistre ici au montage via registerLoadingHandlers.
 */
export interface LoadingHandlers {
  startLoading: () => void;
  stopLoading: () => void;
  notifyError: (message: string) => void;
  notifySuccess: (message: string) => void;
}

let handlers: LoadingHandlers | null = null;

export const registerLoadingHandlers = (h: LoadingHandlers): void => {
  handlers = h;
};

export const loadingService = {
  start: (): void => handlers?.startLoading(),
  stop: (): void => handlers?.stopLoading(),
  error: (message: string): void => handlers?.notifyError(message),
  success: (message: string): void => handlers?.notifySuccess(message),
};