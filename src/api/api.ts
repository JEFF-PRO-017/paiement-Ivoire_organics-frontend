import axios from 'axios';
import { environment } from 'environments/environment';

const BASE_URL = environment.API_URL;
const SITE_KEY = 'io_active_site';

// ── Helpers session ───────────────────────────────────────────────────────────

const getUser = () => JSON.parse(sessionStorage.getItem('authUser') ?? '{}');
const getSite = () => sessionStorage.getItem(SITE_KEY);

const injectHeaders = (config: any) => {
  const user = getUser();
  const site = getSite();
  const isAuthRoute = config.url?.startsWith('/auth/');

  if (user?.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }

  if (!isAuthRoute) {
    if (!site) {
      window.location.href = '/error/no-site';
      return Promise.reject(new Error('Aucun site actif sélectionné'));
    }
    // config.headers['X-Site'] = site;
  }

  return config;
};

// ── Refresh token state ───────────────────────────────────────────────────────

let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string) => void;
  reject:  (err: unknown)  => void;
}> = [];

const flushQueue = (token: string | null, err: unknown = null) => {
  pendingQueue.forEach(({ resolve, reject }) =>
    token ? resolve(token) : reject(err)
  );
  pendingQueue = [];
};

// ── Instance principale ───────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(injectHeaders);

api.interceptors.response.use(
  (response) => response.data ?? response,
  async (error) => {
    const original = error.config;

    // 401 → tentative de refresh
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        });
      }

      isRefreshing = true;

      try {
        const user = getUser();
        const { accessToken } = await api.post('/auth/refresh/', {
          refreshToken: user.refreshToken,
        }) as any;

        const updated = { ...user, accessToken };
        sessionStorage.setItem('authUser', JSON.stringify(updated));

        flushQueue(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);

      } catch (refreshError) {
        flushQueue(null, refreshError);
        sessionStorage.removeItem('authUser');
        sessionStorage.removeItem(SITE_KEY);
        window.location.href = '/login';
        return Promise.reject(refreshError);

      } finally {
        isRefreshing = false;
      }
    }

    // Autres erreurs → normalisation
    const msg =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      (() => {
        switch (error.response?.status) {
          case 500: return 'Internal Server Error';
          case 404: return 'Ressource introuvable';
          default:  return error.message ?? 'Erreur réseau';
        }
      })();

    return Promise.reject(new Error(msg));
  }
);

// ── Instance Blob (PDF / CSV) ─────────────────────────────────────────────────

export const axiosBlob = axios.create({
  baseURL: BASE_URL,
  responseType: 'blob',
});

axiosBlob.interceptors.request.use(injectHeaders);

// ── Helper téléchargement ─────────────────────────────────────────────────────

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}