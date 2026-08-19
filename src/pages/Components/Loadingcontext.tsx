import { registerLoadingHandlers } from 'api/Loadingservice';
import React, {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import AppLoader from './Apploader';
import NotificationStack, { AppNotification } from './Notificationstack';


interface LoadingContextValue {
  /** Déclenche l'overlay plein écran (empile les appels, plusieurs requêtes en //  = OK) */
  startLoading: () => void;
  /** Arrête l'overlay plein écran */
  stopLoading: () => void;
  /** Erreur bloquante (init de l'app, auth...) : remplace l'overlay par un message */
  setFatalError: (message: string) => void;
  clearFatalError: () => void;
  /** Toast d'erreur non bloquant (erreurs de requêtes courantes) */
  notifyError: (message: string) => void;
  /** Toast de succès non bloquant */
  notifySuccess: (message: string) => void;
}

const LoadingContext = createContext<LoadingContextValue | undefined>(undefined);

const AUTO_DISMISS_MS = 4500;

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [fatalError, setFatalErrorState] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const idRef = useRef(0);

  const startLoading = useCallback(() => setPendingCount((c) => c + 1), []);
  const stopLoading = useCallback(() => setPendingCount((c) => Math.max(0, c - 1)), []);

  const setFatalError = useCallback((message: string) => {
    setPendingCount(0);
    setFatalErrorState(message);
  }, []);
  const clearFatalError = useCallback(() => setFatalErrorState(null), []);

  const dismissNotification = useCallback((id: number) => {
    setNotifications((list) => list.filter((n) => n.id !== id));
  }, []);

  const pushNotification = useCallback((type: 'success' | 'danger', message: string) => {
    const id = idRef.current++;
    const next: AppNotification = { id, type, message };
    setNotifications((list) => [...list, next]);
    setTimeout(() => dismissNotification(id), AUTO_DISMISS_MS);
  }, [dismissNotification]);

  const notifyError = useCallback((message: string) => pushNotification('danger', message), [pushNotification]);
  const notifySuccess = useCallback((message: string) => pushNotification('success', message), [pushNotification]);

  // Permet à axios (hors React) d'appeler ces fonctions via loadingService
  useEffect(() => {
    registerLoadingHandlers({
      startLoading, stopLoading, notifyError, notifySuccess,
    });
  }, [startLoading, stopLoading, notifyError, notifySuccess]);

  const value = useMemo(
    () => ({
      startLoading, stopLoading, setFatalError, clearFatalError, notifyError, notifySuccess,
    }),
    [startLoading, stopLoading, setFatalError, clearFatalError, notifyError, notifySuccess],
  );

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <AppLoader
        loading={pendingCount > 0}
        error={fatalError}
        onRetry={clearFatalError}
      />
      <NotificationStack notifications={notifications} onDismiss={dismissNotification} />
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextValue => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading doit être utilisé dans un <LoadingProvider>');
  return ctx;
};