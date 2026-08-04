import { api } from 'api/api';
import { DashboardStats, EmployeAttendanceGroup, HistoriquePaiement, Paginated, PaginatedResponse, Portefeuille, Response, StatutPaiement } from 'pages/Utils/types';

export const paiementService = {

  async getStats(): Promise<Response<DashboardStats>> {
    return api.get('api/paiements/stats/');
  },

  async getJoursCumules(): Promise<Response<string[]>> {
    return api.get('api/paiements/jours-cumules/');
  },

  async getHistorique(limit = 4): Promise<Response<HistoriquePaiement[]>> {
    return api.get(`api/paiements/historique/par-jour/?limit=${limit}`);
  },

  async getEnAttente(page = 1, pageSize = 5): Promise<Paginated<Portefeuille>> {
    return api.get(`api/portefeuilles/?statut=EN_ATTENTE&page=${page}&limit=${pageSize}`);
  },

  async getImpayes(page = 1, pageSize = 5): Promise<Paginated<Portefeuille>> {
    return api.get(`api/portefeuilles/?statut=IMPAYE&page=${page}&limit=${pageSize}`);
  },

  async confirmerRH(ids: number[]): Promise<void> {
    await api.patch('api/paiements/attendances/', {
      ids,
      statut_paiement: 'IMPAYE',
    });
  },

  // ...........................................
  async getAttendances(
    statut_paiement: StatutPaiement,
    page = 1,
    pageSize = 5,
  ): Promise<PaginatedResponse<EmployeAttendanceGroup>> {
    return api.get('/api/paiements/attendances/', {
      params: { statut_paiement, page, page_size: pageSize },
    });
  },
  /**
    * GET /api/paiements/employes/<employeId>/attendances/
    * ⚠️ Endpoint à créer côté back s'il n'existe pas déjà : retourne l'ensemble
    * des attendances d'un employé (toutes statuts confondus), utilisé par la
    * page de détail (useDetailEmploye) pour afficher calendrier + actions groupées.
    */
  getEmployeAttendanceGroup: (employeId: number): Promise<EmployeAttendanceGroup> =>
    api.get(`/api/paiements/employes/?employe_id=${employeId}`).then(r => r.data),

};