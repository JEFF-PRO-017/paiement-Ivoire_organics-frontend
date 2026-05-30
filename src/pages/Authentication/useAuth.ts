/*
  ══════════════════════════════════════════════════════════════════
  useAuth.ts
  ══════════════════════════════════════════════════════════════════
  Centralise :
    • État utilisateur + site actif
    • Login / Logout
    • Refresh token automatique (avant expiration)
    • Déconnexion par inactivité (mouse, keydown, touchstart)
    • Déconnexion à la fermeture de l'onglet (sessionStorage natif)
  ══════════════════════════════════════════════════════════════════
*/

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthUser, authService } from './authService';
// ── Types ─────────────────────────────────────────────────────────────────────

export interface UseAuthReturn {
  user: AuthUser | null;
  siteActif: string | null;
  isLoading: boolean;
  error: string | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setSiteActif: (site: string) => void;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = (): UseAuthReturn => {
  const navigate = useNavigate();

  const [user, setUser] = useState<AuthUser | null>(authService.getUser());
  const [siteActif, setSiteActifState] = useState<string | null>(authService.getSiteActif());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const inactivityTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [token, setToken] = useState<string | null>(user?.accessToken ?? null);
  const [loading, setLoading] = useState(user ? false : true);

  // ── Déconnexion ────────────────────────────────────────────────────────────

  const logout = useCallback((reason?: string) => {
    authService.logout();
    setUser(null);
    setSiteActifState(null);
    clearTimeout(inactivityTimer.current!);
    clearTimeout(refreshTimer.current!);
    if (reason) toast.info(reason);
    navigate('/login');
  }, [navigate]);

  // ── Minuterie d'inactivité ─────────────────────────────────────────────────

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current!);
    inactivityTimer.current = setTimeout(() => {
      logout('Session expirée par inactivité. Veuillez vous reconnecter.');
    }, authService.INACTIVITY_MS);
  }, [logout]);

  // ── Refresh token automatique ──────────────────────────────────────────────

  const scheduleRefresh = useCallback((currentUser: AuthUser) => {
    clearTimeout(refreshTimer.current!);
    const msUntilExpiry = new Date(currentUser.expirationTime).getTime() - Date.now();
    const msUntilRefresh = msUntilExpiry - authService.REFRESH_MARGIN_MS;

    if (msUntilRefresh <= 0) {
      // Token déjà proche de l'expiration — refresh immédiat
      authService.refreshToken()
        .then(updated => { setUser(updated); scheduleRefresh(updated); })
        .catch(() => logout('Votre session a expiré. Veuillez vous reconnecter.'));
      return;
    }

    refreshTimer.current = setTimeout(async () => {
      try {
        const updated = await authService.refreshToken();
        setUser(updated);
        scheduleRefresh(updated);
      } catch {
        logout('Votre session a expiré. Veuillez vous reconnecter.');
      }
    }, msUntilRefresh);
  }, [logout]);

  // ── Mise en place des timers quand l'utilisateur change ───────────────────

  useEffect(() => {
    if (!user) return;

    scheduleRefresh(user);
    resetInactivityTimer();

    const events = ['mousemove', 'keydown', 'touchstart', 'click'] as const;
    events.forEach(e => window.addEventListener(e, resetInactivityTimer));

    setLoading(token ? false : true);

    return () => {
      clearTimeout(inactivityTimer.current!);
      clearTimeout(refreshTimer.current!);
      events.forEach(e => window.removeEventListener(e, resetInactivityTimer));
    };
  }, [user, scheduleRefresh, resetInactivityTimer]);

  // ── Login ──────────────────────────────────────────────────────────────────

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const loggedUser = await authService.login(email, password);
      setUser(loggedUser);
      setSiteActifState(authService.getSiteActif());
      navigate('/dashboard');
    } catch (e: any) {
      setError(e?.message ?? 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  // ── Changer de site actif ──────────────────────────────────────────────────

  const setSiteActif = (site: string) => {
    authService.setSiteActif(site);
    setSiteActifState(site);
  };

  return { user, siteActif, isLoading, error, token,loading, login, logout, setSiteActif };
};