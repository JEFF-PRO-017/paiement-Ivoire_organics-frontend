import { api } from 'api/api';
import { DashboardStats, HistoriquePaiement, Paginated, Portefeuille } from 'pages/Utils/types';

export const paiementService = {

  async getStats(): Promise<DashboardStats> {
    return api.get('/paiement/stats/');
  },

  async getJoursCumules(): Promise<string[]> {
    return api.get('/paiement/jours-cumules/');
  },

  async getHistorique(limit = 4): Promise<HistoriquePaiement[]> {
    return api.get(`/paiement/historique-par-jour-paiement/?limit=${limit}`);
  },

  async getEnAttente(page = 1, pageSize = 5): Promise<Paginated<Portefeuille>> {
    return api.get(`/portefeuilles/?statut=EN_ATTENTE&page=${page}&limit=${pageSize}`);
  },

  async getImpayes(page = 1, pageSize = 5): Promise<Paginated<Portefeuille>> {
    return api.get(`/portefeuilles/?statut=IMPAYE&page=${page}&limit=${pageSize}`);
  },

  async confirmerRH(ids: number[]): Promise<void> {
    await Promise.all(ids.map(id => api.post(`/portefeuilles/${id}/confirmer-rh/`)));
  },
};