import axios from 'axios';
import { environment } from 'environments/environment';
import { ensureFreshToken } from 'pages/Authentication/utilis';
import { loadingService } from './Loadingservice';

const BASE_URL = environment.API_URL;
const REDIRECT_KEY = 'redirectAfterLogin';

interface ApiEnvelope<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  errors: Record<string, string[]> | string | null;
  code?: string;
}

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

// ── Requête ───────────────────────────────────────────────────────────
api.interceptors.request.use((config: any) => {
  if (!config.silentLoading) {
    loadingService.start();
  }
  return injectHeaders(config);
});

// ── Réponse ───────────────────────────────────────────────────────────
api.interceptors.response.use(
  (response: any) => {
    if (!response.config.silentLoading) {
      loadingService.stop();
    }

    const envelope = response.data as ApiEnvelope;
    const method = response.config.method?.toLowerCase();
    const isWrite = method && ['post', 'put', 'patch', 'delete'].includes(method);
    const custom = response.config.successMessage;
    const silent = response.config.silentSuccess;

    if (custom) {
      loadingService.success(custom);
    } else if (isWrite && !silent) {
      loadingService.success(envelope?.message ?? 'Opération effectuée avec succès.');
    }

    return envelope as any;
  },
  async (error: any) => {
    if (!error.config?.silentLoading) {
      loadingService.stop();
    }
    const original = error.config ?? {};

    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const from = window.location.pathname + window.location.search;
      if (!window.location.pathname.startsWith('/login')) {
        sessionStorage.setItem(REDIRECT_KEY, from);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    const envelope = error.response?.data as ApiEnvelope | undefined;

    const flattenErrors = (errs: ApiEnvelope['errors']): string | null => {
      if (!errs) return null;
      if (typeof errs === 'string') return errs;
      return Object.values(errs).flat().join(' ');
    };

    const msg =
      flattenErrors(envelope?.errors?? '') ??
      envelope?.message ??
      (() => {
        switch (error.response?.status) {
          case 500: return 'Erreur interne du serveur.';
          case 404: return 'Ressource introuvable.';
          default: return error.message ?? 'Erreur réseau.';
        }
      })();

    if (!original.silentError) {
      loadingService.error(msg);
    }

    return Promise.reject(new Error(msg));
  }
);

// ── Instance Blob (PDF / CSV) ────────────────────────────────────────
export const axiosBlob = axios.create({
  baseURL: BASE_URL,
  responseType: 'blob',
});

axiosBlob.interceptors.request.use((config: any) => {
  if (!config.silentLoading) loadingService.start();
  return injectHeaders(config);
});
axiosBlob.interceptors.response.use(
  (response: any) => {
    if (!response.config.silentLoading) loadingService.stop();
    return response;
  },
  (error: any) => {
    if (!error.config?.silentLoading) loadingService.stop();
    return Promise.reject(error);
  },
);

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}