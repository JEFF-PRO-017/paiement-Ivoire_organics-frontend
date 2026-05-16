import {
  DashboardStats, Employe, HistoriquePaiement, Paginated,
  Portefeuille, StatutEmploye, StatutPortefeuille,
} from './types';

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Helpers ───────────────────────────────────────────────────────────────────

const makeEmploye = (id: number, nom: string, dept: string, site: string): Employe => ({
  id, odoo_id: `EMP00${id}`, nom_complet: nom,
  departement: dept, site_travail: site, statut: StatutEmploye.ACTIF,
});

// ── Fake data ─────────────────────────────────────────────────────────────────

const STATS: DashboardStats = {
  nombre_employes: 247,
  total_jours_cumules: 1842,
  somme_totale_a_payer: 4_230_000,
};

const JOURS_CUMULES = [
  '2025-05-02', '2025-05-07', '2025-05-10',
  '2025-05-15', '2025-05-18', '2025-05-25',
];

const HISTORIQUE: HistoriquePaiement[] = [
  { id: 1, date_paiement: '2025-05-12', montant_total: 850_000 },
  { id: 2, date_paiement: '2025-04-28', montant_total: 720_000 },
  { id: 3, date_paiement: '2025-04-15', montant_total: 690_000 },
];

// FIX: useState retiré — simple tableau mutable, useState n'existe pas hors composant React
let enAttenteData: Portefeuille[] = [
  { id: 1, nombre_jours_impayes: 12, montant_journalier: 15000, cree_le: '2025-04-01', modifie_le: '2025-05-01', statut: StatutPortefeuille.EN_ATTENTE, employe_id: 1, periodes_paiement: ['2025-05-02', '2025-05-07', '2025-05-10', '2025-05-15', '2025-05-18', '2025-05-25'], employe: makeEmploye(1, 'Jean Dupont', 'Comptabilité', 'Siège') },
];

const impayesData: Portefeuille[] = [
  { id: 101, nombre_jours_impayes: 5, montant_journalier: 15000, cree_le: '2025-03-15', modifie_le: '2025-04-30', statut: StatutPortefeuille.IMPAYE, employe_id: 21, periodes_paiement: ['2025-04-10', '2025-04-15', '2025-04-20'], employe: makeEmploye(21, 'Rachel Abomo', 'Finance', 'Siège') },
  { id: 102, nombre_jours_impayes: 20, montant_journalier: 15000, cree_le: '2025-02-01', modifie_le: '2025-04-25', statut: StatutPortefeuille.IMPAYE, employe_id: 22, periodes_paiement: ['2025-04-01', '2025-04-05', '2025-04-12'], employe: makeEmploye(22, 'Samuel Ondoua', 'Logistique', 'Dépôt C') },
  { id: 103, nombre_jours_impayes: 9, montant_journalier: 15000, cree_le: '2025-03-01', modifie_le: '2025-04-28', statut: StatutPortefeuille.IMPAYE, employe_id: 23, periodes_paiement: ['2025-04-08', '2025-04-16', '2025-04-22'], employe: makeEmploye(23, 'Thérèse Nkoa', 'Production', 'Usine N') },
];

// ── Service ───────────────────────────────────────────────────────────────────

export const paiementService = {
  // TODO: GET /paiement/stats
  async getStats(): Promise<DashboardStats> {
    await sleep(600); return STATS;
  },
  // TODO: GET /paiement/jours-cumules
  async getJoursCumules(): Promise<string[]> {
    await sleep(900); return JOURS_CUMULES;
  },
  // TODO: GET /paiement/historique?limit=3
  async getHistorique(limit = 3): Promise<HistoriquePaiement[]> {
    await sleep(1100); return HISTORIQUE.slice(0, limit);
  },
  // TODO: GET /portefeuilles?statut=EN_ATTENTE&page=X&limit=5
  async getEnAttente(page = 1, limit = 5): Promise<Paginated<Portefeuille>> {
    await sleep(1400);
    const start = (page - 1) * limit;
    return { data: enAttenteData.slice(start, start + limit), total: enAttenteData.length, page, limit };
  },
  // TODO: GET /portefeuilles?statut=IMPAYE&page=X&limit=5
  async getImpayes(page = 1, limit = 5): Promise<Paginated<Portefeuille>> {
    await sleep(1700);
    const start = (page - 1) * limit;
    return { data: impayesData.slice(start, start + limit), total: impayesData.length, page, limit };
  },
  // TODO: PATCH /portefeuilles/confirmer-rh  { ids }
  async confirmerRH(ids: number[]): Promise<void> {
    await sleep(600);
    const confirmes = enAttenteData
      .filter(p => ids.includes(p.id))
      .map(p => ({ ...p, statut: StatutPortefeuille.CONFIRME_RH }));

    enAttenteData = enAttenteData.filter(p => !ids.includes(p.id));
    impayesData.push(...confirmes);
  },
};

export type { Employe } from './types';

// Salut l'équipe,

// Je vous envoie le brief technique pour la fonctionnalité de vérification d'empreinte digitale sur le module de paiement.

// ──────────────────────────────────
// 🎯 CONTEXTE
// ──────────────────────────────────
// Avant de valider une action sensible (Confirmer RH ou Marquer comme payé), l'employé concerné doit poser son doigt sur un terminal USB branché sur la machine du caissier/RH. Le front poll le back jusqu'à confirmation, puis débloque le bouton de validation.

// ──────────────────────────────────
// 📡 ENDPOINT ATTENDU
// ──────────────────────────────────
// GET /empreinte/verify?employe_id={id}
// Authorization: Bearer <token>

// Réponse succès (200) :
// {
//   "verified": true,
//   "employe_id": 1
// }

// Réponse échec (200) :
// {
//   "verified": false,
//   "message": "Empreinte non reconnue"
// }

// Réponse terminal non connecté (503 ou 200) :
// {
//   "verified": false,
//   "message": "Terminal non disponible"
// }

// ──────────────────────────────────
// ⚙️ COMPORTEMENT ATTENDU
// ──────────────────────────────────
// 1. L'utilisateur clique sur "Confirmer RH" ou "Marquer comme payé".
// 2. Une modal s'ouvre côté front et démarre un polling sur /empreinte/verify toutes les 1,5 secondes.
// 3. Le terminal USB lit l'empreinte et l'envoie au back (votre partie).
// 4. Le back compare avec le template stocké pour cet employe_id.
// 5. Dès que verified === true, le front arrête le polling et affiche le bouton de validation.
// 6. L'utilisateur clique → l'action métier est exécutée (POST confirmer-rh ou PATCH payer).

// ──────────────────────────────────
// 🗄️ AUTRES ENDPOINTS LIÉS
// ──────────────────────────────────
// • POST   /portefeuilles/:id/confirmer-rh        → passer statut à CONFIRME_RH
// • PATCH  /portefeuilles/:id/payer               → passer statut à PAYE
// • GET    /portefeuilles/historique?employe_id=:id → historique des paiements de l'employé
// • GET    /portefeuilles/:id/export-pdf           → retourner un Blob PDF
// • DELETE /portefeuilles/:id                      → reset (204 No Content)

// ──────────────────────────────────
// ❓ QUESTIONS / POINTS À CLARIFIER
// ──────────────────────────────────
// • Comment le terminal USB remonte-t-il les données au back ? Via driver dédié, service local, ou API système ?
// • Le template d'empreinte est stocké où ? Dans la table employés (colonne empreinte_template) ?
// • Faut-il un timeout côté back si aucune empreinte n'est posée au bout de X secondes ?
// • La session de vérification doit-elle être invalidée après usage (usage unique par action) ?

// Dites-moi si vous avez besoin de précisions supplémentaires. Merci 🙏