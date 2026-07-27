import axios from 'axios';
import { environment } from 'environments/environment';
import { ensureFreshToken } from 'pages/Authentication/utilis';

const BASE_URL = environment.API_URL;
const REDIRECT_KEY = 'redirectAfterLogin';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

export const rawApi = axios.create({ baseURL: BASE_URL });


const injectHeaders = async (config: any) => {
  const token = await ensureFreshToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

// remplace injectHeaders : async, vérifie et refresh si besoin avant d'attacher le token
api.interceptors.request.use(injectHeaders);

api.interceptors.response.use(
  (response) => {
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