/*
  authService.ts
  ──────────────
  Auth connectée au backend Django.
  - Login     → POST /auth/login/
  - Refresh   → POST /auth/refresh/
  - Logout    → suppression session locale
*/

import { api } from "api/api";


export const INACTIVITY_MS     = 30 * 60 * 1_000;
export const REFRESH_MARGIN_MS =  2 * 60 * 1_000;

const SESSION_KEY = 'authUser';
const SITE_KEY    = 'io_active_site';

export interface AuthUser {
  username:       string;
  first_name:     string;
  last_name:      string;
  role:           'admin' | 'user';
  email:          string;
  email_verified: boolean;
  accessToken:    string;
  refreshToken:   string;
  expirationTime: string;
  sites:          string[];
}

const saveUser  = (user: AuthUser) => sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
const clearUser = () => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SITE_KEY);
};

export const authService = {

  // POST /auth/login/
  async login(email: string, password: string): Promise<AuthUser> {
    const { data } = await api.post<AuthUser>('/auth/login/', { email, password });
    saveUser(data);
    authService.setSiteActif(data.sites[0] ?? '');
    return data;
  },

  // POST /auth/refresh/
  async refreshToken(): Promise<AuthUser> {
    const current = authService.getUser();
    if (!current) throw new Error('Non authentifié');
    const { data } = await api.post<Pick<AuthUser, 'accessToken' | 'expirationTime'>>(
      '/auth/refresh/',
      { refreshToken: current.refreshToken }
    );
    const updated = { ...current, ...data };
    saveUser(updated);
    return updated;
  },

  logout(): void { clearUser(); },

  getUser(): AuthUser | null {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? ''); }
    catch { return null; }
  },

  isAuthenticated(): boolean {
    const user = authService.getUser();
    return !!user && new Date(user.expirationTime) > new Date();
  },

  getSiteActif: (): string | null => sessionStorage.getItem(SITE_KEY),
  setSiteActif: (site: string)    => sessionStorage.setItem(SITE_KEY, site),

  INACTIVITY_MS,
  REFRESH_MARGIN_MS,
};