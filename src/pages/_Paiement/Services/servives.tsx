

// ─── Fake data ────────────────────────────────────────────────────────────────

import { DashboardStats, HistoriquePaiement, Portefeuille, StatutPortefeuille, StatutEmploye, PaginatedResponse } from "../Models/_model";

const fakeStats: DashboardStats = {
  nombre_employes: 247,
  total_jours_cumules: 1842,
  somme_totale_a_payer: 4230000,
};

const fakeJoursCumules: string[] = [
  '2025-05-02', '2025-05-07', '2025-05-10',
  '2025-05-15', '2025-05-18', '2025-05-25',
];

const fakeHistorique: HistoriquePaiement[] = [
  { id: 1, date_paiement: '2025-05-12', montant_total: 850000 },
  { id: 2, date_paiement: '2025-04-28', montant_total: 720000 },
  { id: 3, date_paiement: '2025-04-15', montant_total: 690000 },
];

const fakePortefeuillesEnAttente: Portefeuille[] = [
  {
    id: 1, nombre_jours_impayes: 12, montant_journalier: 15000,
    cree_le: '2025-04-01', modifie_le: '2025-05-01',
    statut: StatutPortefeuille.EN_ATTENTE, employe_id: 1,
    periodes_paiement: ['2025-05-02', '2025-05-07', '2025-05-10', '2025-05-15', '2025-05-18', '2025-05-25'],
    employe: { id: 1, odoo_id: 'EMP001', nom_complet: 'Jean Dupont', departement: 'Comptabilité', site_travail: 'Siège', statut: StatutEmploye.ACTIF },
  },
  {
    id: 2, nombre_jours_impayes: 8, montant_journalier: 15000,
    cree_le: '2025-04-05', modifie_le: '2025-05-02',
    statut: StatutPortefeuille.EN_ATTENTE, employe_id: 2,
    periodes_paiement: ['2025-05-03', '2025-05-08', '2025-05-12', '2025-05-19'],
    employe: { id: 2, odoo_id: 'EMP002', nom_complet: 'Marie Martin', departement: 'RH', site_travail: 'Annexe B', statut: StatutEmploye.ACTIF },
  },
  {
    id: 3, nombre_jours_impayes: 15, montant_journalier: 15000,
    cree_le: '2025-03-20', modifie_le: '2025-05-03',
    statut: StatutPortefeuille.EN_ATTENTE, employe_id: 3,
    periodes_paiement: ['2025-05-01', '2025-05-06', '2025-05-09', '2025-05-14', '2025-05-20'],
    employe: { id: 3, odoo_id: 'EMP003', nom_complet: 'Paul Kana', departement: 'Technique', site_travail: 'Siège', statut: StatutEmploye.ACTIF },
  },
  {
    id: 4, nombre_jours_impayes: 6, montant_journalier: 15000,
    cree_le: '2025-04-10', modifie_le: '2025-05-04',
    statut: StatutPortefeuille.EN_ATTENTE, employe_id: 4,
    periodes_paiement: ['2025-05-05', '2025-05-11', '2025-05-16'],
    employe: { id: 4, odoo_id: 'EMP004', nom_complet: 'Léa Essomba', departement: 'Production', site_travail: 'Usine N', statut: StatutEmploye.ACTIF },
  },
];

const fakePortefeuillesImpayes: Portefeuille[] = [
  {
    id: 5, nombre_jours_impayes: 5, montant_journalier: 15000,
    cree_le: '2025-03-15', modifie_le: '2025-04-30',
    statut: StatutPortefeuille.IMPAYE, employe_id: 5,
    periodes_paiement: ['2025-04-10', '2025-04-15', '2025-04-20'],
    employe: { id: 5, odoo_id: 'EMP005', nom_complet: 'Sophie Biya', departement: 'Finance', site_travail: 'Siège', statut: StatutEmploye.ACTIF },
  },
  {
    id: 6, nombre_jours_impayes: 20, montant_journalier: 15000,
    cree_le: '2025-02-01', modifie_le: '2025-04-25',
    statut: StatutPortefeuille.IMPAYE, employe_id: 6,
    periodes_paiement: ['2025-04-01', '2025-04-05', '2025-04-12'],
    employe: { id: 6, odoo_id: 'EMP006', nom_complet: 'Alain Mbarga', departement: 'Logistique', site_travail: 'Dépôt C', statut: StatutEmploye.ACTIF },
  },
  {
    id: 7, nombre_jours_impayes: 9, montant_journalier: 15000,
    cree_le: '2025-03-01', modifie_le: '2025-04-28',
    statut: StatutPortefeuille.IMPAYE, employe_id: 7,
    periodes_paiement: ['2025-04-08', '2025-04-16', '2025-04-22'],
    employe: { id: 7, odoo_id: 'EMP007', nom_complet: 'Claudine Ngo', departement: 'Production', site_travail: 'Usine N', statut: StatutEmploye.ACTIF },
  },
];

// ─── Délai simulé ─────────────────────────────────────────────────────────────

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Service ──────────────────────────────────────────────────────────────────

// TODO: remplacer chaque return fake par un vrai appel fetch/axios

export const paiementService = {

  // GET /paiement/stats
  async getStats(): Promise<DashboardStats> {
    await delay(600);
    return fakeStats;
  },

  // GET /paiement/jours-cumules
  async getJoursCumules(): Promise<string[]> {
    await delay(900);
    return fakeJoursCumules;
  },

  // GET /paiement/historique?limit=3
  async getHistorique(limit = 3): Promise<HistoriquePaiement[]> {
    await delay(1100);
    return fakeHistorique.slice(0, limit);
  },

  // GET /portefeuilles?statut=EN_ATTENTE&page=X&limit=10
  async getPortefeuillesEnAttente(page = 1, limit = 10): Promise<PaginatedResponse<Portefeuille>> {
    await delay(1400);
    const start = (page - 1) * limit;
    return {
      data: fakePortefeuillesEnAttente.slice(start, start + limit),
      total: 68,
      page,
      limit,
    };
  },

  // GET /portefeuilles?statut=IMPAYE&page=X&limit=10
  async getPortefeuillesImpayes(page = 1, limit = 10): Promise<PaginatedResponse<Portefeuille>> {
    await delay(1700);
    const start = (page - 1) * limit;
    return {
      data: fakePortefeuillesImpayes.slice(start, start + limit),
      total: 34,
      page,
      limit,
    };
  },

  // PATCH /portefeuilles/confirmer-rh  body: { ids: number[] }
  async confirmerRH(ids: number[]): Promise<Portefeuille[]> {
    await delay(800);
    // TODO: return await api.patch('/portefeuilles/confirmer-rh', { ids });
    return fakePortefeuillesEnAttente
      .filter(p => ids.includes(p.id))
      .map(p => ({ ...p, statut: StatutPortefeuille.CONFIRME_RH }));
  },
};