/*
  ══════════════════════════════════════════════════════════════════
  authService.ts
  ══════════════════════════════════════════════════════════════════
  Gère :
    • Login (mock → remplacer par fetch /auth/login)
    • Stockage session (sessionStorage — effacé à la fermeture du navigateur)
    • Refresh token automatique avant expiration
    • Déconnexion par inactivité (INACTIVITY_MS)
    • Site actif (premier site par défaut)

  POUR CONNECTER LE BACKEND :
    Supprimer MOCK_USERS et décommenter les blocs fetch() dans
    login() et refreshToken().
  ══════════════════════════════════════════════════════════════════
*/

// ── Constantes ────────────────────────────────────────────────────────────────

/** Délai d'inactivité avant déconnexion automatique (15 min). */
const INACTIVITY_MS = 15 * 60 * 1_000;

/** Marge avant expiration du token pour déclencher le refresh (2 min). */
const REFRESH_MARGIN_MS = 2 * 60 * 1_000;

const SESSION_KEY  = 'authUser';
const SITE_KEY     = 'io_active_site';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface AuthUser {
  username:       string;
  first_name:     string;
  last_name:      string;
  role:           'admin' | 'user';
  email:          string;
  email_verified: boolean;
  accessToken:    string;
  refreshToken:   string;
  expirationTime: string; // ISO string
  sites:          string[];
}

// ── Données mock ──────────────────────────────────────────────────────────────
// TODO: supprimer quand POST /auth/login est disponible

const makeMockUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  username:       'admin',
  first_name:     'Jean',
  last_name:      'Dupont',
  email:          'admin@ivoireorganics.com',
  email_verified: true,
  accessToken:    `mock_access_${Date.now()}`,
  refreshToken:   `mock_refresh_${Date.now()}`,
  expirationTime: new Date(Date.now() + 60 * 60 * 1_000).toISOString(), // +1h
  sites:          ['Abidjan - Siège', 'Bouaké - Entrepôt', 'San-Pédro - Dépôt'],
  role:           'admin',
  ...overrides,
});

const MOCK_USERS: Record<string, { password: string; user: AuthUser }> = {
  'admin@ivoireorganics.com': {
    password: 'admin123',
    user: makeMockUser(),
  },
  'demo@ivoireorganics.com': {
    password: 'demo123',
    user: makeMockUser({
      username:   'demo',
      first_name: 'Marie',
      last_name:  'Koné',
      email:      'demo@ivoireorganics.com',
      sites:      ['Bouaké - Entrepôt'],
      role:       'user',
    }),
  },
};

// ── Helpers session ───────────────────────────────────────────────────────────

const saveUser = (user: AuthUser): void => {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
};

const clearUser = (): void => {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SITE_KEY);
};

// ── Service ───────────────────────────────────────────────────────────────────

export const authService = {

  // ── Login ──────────────────────────────────────────────────────────────────

  /**
   * Authentifie l'utilisateur.
   *
   * TODO (backend prêt) :
   *   const res = await fetch('/auth/login', {
   *     method:  'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body:    JSON.stringify({ email, password }),
   *   });
   *   if (!res.ok) {
   *     const err = await res.json();
   *     throw new Error(err.message ?? 'Identifiants incorrects');
   *   }
   *   const user: AuthUser = await res.json();
   *   saveUser(user);
   *   authService.setSiteActif(user.sites[0]);
   *   return user;
   */
  async login(email: string, password: string): Promise<AuthUser> {
    await new Promise(r => setTimeout(r, 600)); // simuler latence réseau

    const entry = MOCK_USERS[email.toLowerCase()];
    if (!entry || entry.password !== password) {
      throw new Error('Identifiants incorrects');
    }
    debugger
    const user = { ...entry.user, accessToken: `mock_access_${Date.now()}` };
    saveUser(user);
    authService.setSiteActif(user.sites[0]);
    return user;
  },

  // ── Refresh token ──────────────────────────────────────────────────────────

  /**
   * Renouvelle l'access token via le refresh token.
   *
   * TODO (backend prêt) :
   *   const current = authService.getUser();
   *   if (!current) throw new Error('Non authentifié');
   *   const res = await fetch('/auth/refresh', {
   *     method:  'POST',
   *     headers: { 'Content-Type': 'application/json' },
   *     body:    JSON.stringify({ refreshToken: current.refreshToken }),
   *   });
   *   if (!res.ok) { authService.logout(); throw new Error('Session expirée'); }
   *   const { accessToken, expirationTime }: Pick<AuthUser, 'accessToken' | 'expirationTime'>
   *     = await res.json();
   *   const updated = { ...current, accessToken, expirationTime };
   *   saveUser(updated);
   *   return updated;
   */
  async refreshToken(): Promise<AuthUser> {
    const current = authService.getUser();
    if (!current) throw new Error('Non authentifié');

    await new Promise(r => setTimeout(r, 300));

    const updated: AuthUser = {
      ...current,
      accessToken:    `mock_access_${Date.now()}`,
      expirationTime: new Date(Date.now() + 60 * 60 * 1_000).toISOString(),
    };
    saveUser(updated);
    return updated;
  },

  // ── Logout ─────────────────────────────────────────────────────────────────

  logout(): void {
    clearUser();
  },

  // ── Accesseurs session ─────────────────────────────────────────────────────

  getUser(): AuthUser | null {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw) as AuthUser; } catch { return null; }
  },

  isAuthenticated(): boolean {
    const user = authService.getUser();
    if (!user) return false;
    return new Date(user.expirationTime) > new Date();
  },

  // ── Site actif ─────────────────────────────────────────────────────────────

  getSiteActif(): string | null {
    return sessionStorage.getItem(SITE_KEY);
  },

  setSiteActif(site: string): void {
    sessionStorage.setItem(SITE_KEY, site);
  },

  // ── Minuteries (appelées par useAuth) ────────────────────────────────────

  INACTIVITY_MS,
  REFRESH_MARGIN_MS,
};