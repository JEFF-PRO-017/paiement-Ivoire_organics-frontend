/*
  paiementService.ts
  ──────────────────
  GET  /paiement/stats/
  GET  /paiement/jours-cumules/
  GET  /paiement/historique/
  GET  /portefeuilles/?statut=EN_ATTENTE
  GET  /portefeuilles/?statut=IMPAYE
  POST /portefeuilles/:id/confirmer-rh/
*/

import { api } from 'api/api';
import { DashboardStats, HistoriquePaiement, Paginated, Portefeuille } from './types';

export const paiementService = {

  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get('/paiement/stats/');
    return data;
  },

  async getJoursCumules(): Promise<string[]> {
    const { data } = await api.get('/paiement/jours-cumules/');
    return data;
  },

  async getHistorique(limit = 3): Promise<HistoriquePaiement[]> {
    const { data } = await api.get(`/paiement/historique/?limit=${limit}`);
    return data;
  },

  async getEnAttente(page = 1, pageSize = 5): Promise<Paginated<Portefeuille>> {
    const { data } = await api.get(`/portefeuilles/?statut=EN_ATTENTE&page=${page}&limit=${pageSize}`);
    return data;
  },

  async getImpayes(page = 1, pageSize = 5): Promise<Paginated<Portefeuille>> {
    const { data } = await api.get(`/portefeuilles/?statut=IMPAYE&page=${page}&limit=${pageSize}`);
    return data;
  },

  // Le back traite un id à la fois — on parallélise
  async confirmerRH(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => api.post(`/portefeuilles/${id}/confirmer-rh/`)));
  },
};