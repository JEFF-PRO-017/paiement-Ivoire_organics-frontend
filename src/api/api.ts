/*
  api.ts
  ──────
  Client Axios centralisé.
  - Injecte le Bearer token automatiquement
  - Intercepteur de réponse : normalise les erreurs Django
  - axiosBlob : pour les téléchargements PDF/CSV
*/

import axios from 'axios';
import { environment } from 'environments/environment';

const BASE_URL = environment.API_URL;

// ── Instance principale ───────────────────────────────────────────────────────

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Injecte le token avant chaque requête
api.interceptors.request.use((config) => {
  const user = JSON.parse(sessionStorage.getItem('authUser') ?? '{}');
  if (user?.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }
  return config;
});

// Normalise les erreurs Django (detail, message, ou statut HTTP)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      `Erreur ${error.response?.status ?? 'réseau'}`;
    return Promise.reject(new Error(msg));
  }
);

// ── Instance Blob (PDF / CSV) ─────────────────────────────────────────────────

export const axiosBlob = axios.create({
  baseURL: BASE_URL,
  responseType: 'blob',
});

axiosBlob.interceptors.request.use((config) => {
  const user = JSON.parse(sessionStorage.getItem('authUser') ?? '{}');
  if (user?.accessToken) {
    config.headers.Authorization = `Bearer ${user.accessToken}`;
  }
  return config;
});

// ── Helper téléchargement ─────────────────────────────────────────────────────

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  Object.assign(document.createElement('a'), { href: url, download: filename }).click();
  URL.revokeObjectURL(url);
}