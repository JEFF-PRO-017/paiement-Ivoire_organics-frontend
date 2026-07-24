import axios from 'axios';
import { environment } from 'environments/environment';

const BASE_URL = environment.API_URL;
const REDIRECT_KEY = 'redirectAfterLogin';

const injectHeaders = (config: any) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
};

// ── Instance principale ─────────────────────────────────────────────────
export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(injectHeaders);

api.interceptors.response.use(
  (response) => {
    // Le back renouvelle le token à chaque requête réussie
    const newToken = response.headers['x-new-access-token'];
    if (newToken) localStorage.setItem('token', newToken);
    console.log('response',response)
    return response.data ?? response;
  },
  async (error) => {
    const original = error.config ?? {};
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;

      // On garde la page courante pour y revenir après login
      const from = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith('/login')) {
        sessionStorage.setItem(REDIRECT_KEY, from);
      }

      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';

    }

    const msg =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      (() => {
        switch (error.response?.status) {
          case 500: return 'Internal Server Error';
          case 404: return 'Ressource introuvable';
          default: return error.message ?? 'Erreur réseau';
        }
      })();

    return Promise.reject(new Error(msg));
  }
);

// ── Instance Blob (PDF / CSV) ───────────────────────────────────────────
export const axiosBlob = axios.create({
  baseURL: BASE_URL,
  responseType: 'blob',
});

axiosBlob.interceptors.request.use(injectHeaders);

// ── Helper téléchargement ───────────────────────────────────────────────
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}