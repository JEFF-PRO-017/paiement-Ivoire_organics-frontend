/*
  ══════════════════════════════════════════════════════════════════
  historiqueService.ts
  ══════════════════════════════════════════════════════════════════
  Couche data du module historique paiements.

  POUR CONNECTER LE BACKEND :
    Supprimer FAKE_DATA et décommenter les blocs fetch() dans
    chaque méthode. Ajuster les URLs selon votre base path API.
  ══════════════════════════════════════════════════════════════════
*/

import { StatutPortefeuille } from '../types';
import { LignePaiement, FiltresState } from './historique.types';

// ── Données de test ───────────────────────────────────────────────────────────
// TODO: supprimer quand GET /paiement/historique est disponible

const FAKE_DATA: LignePaiement[] = [
  { id: 1, date: '2025-05-12', employe_nom: 'Jean Dupont',  employe_id: 'EMP001', departement: 'Comptabilité', jours: 12, montant: 180000, statut: StatutPortefeuille.PAYE },
  { id: 2, date: '2025-05-10', employe_nom: 'Marie Martin', employe_id: 'EMP002', departement: 'RH',           jours: 8,  montant: 120000, statut: StatutPortefeuille.PAYE },
  { id: 3, date: '2025-05-07', employe_nom: 'Paul Kana',    employe_id: 'EMP003', departement: 'Technique',    jours: 15, montant: 225000, statut: StatutPortefeuille.CONFIRME_RH },
  { id: 4, date: '2025-05-05', employe_nom: 'Léa Essomba',  employe_id: 'EMP004', departement: 'Production',  jours: 6,  montant: 90000,  statut: StatutPortefeuille.PAYE },
  { id: 5, date: '2025-04-28', employe_nom: 'Sophie Biya',  employe_id: 'EMP005', departement: 'Finance',     jours: 5,  montant: 75000,  statut: StatutPortefeuille.PAYE },
  { id: 6, date: '2025-04-25', employe_nom: 'Alain Mbarga', employe_id: 'EMP006', departement: 'Logistique',  jours: 20, montant: 300000, statut: StatutPortefeuille.PAYE },
  { id: 7, date: '2025-04-15', employe_nom: 'Claudine Ngo', employe_id: 'EMP007', departement: 'Production',  jours: 9,  montant: 135000, statut: StatutPortefeuille.PAYE },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const authHeader = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization:  `Bearer ${localStorage.getItem('token') ?? ''}`,
});

/** Sérialise les filtres actifs en URLSearchParams pour les endpoints GET. */
const filtresEnParams = (filtres: Partial<FiltresState>): URLSearchParams => {
  const p = new URLSearchParams();
  if (filtres.search)                  p.set('search',     filtres.search);
  if (filtres.dept && filtres.dept !== 'Tous') p.set('dept', filtres.dept);
  if (filtres.dateRange?.length === 2) {
    p.set('date_debut', filtres.dateRange[0].toISOString());
    p.set('date_fin',   filtres.dateRange[1].toISOString());
  }
  return p;
};

// ── Service ───────────────────────────────────────────────────────────────────

export const historiqueService = {

  /**
   * Charge la liste complète des paiements.
   *
   * TODO (backend prêt) :
   *   const res = await fetch(`/paiement/historique?${filtresEnParams(filtres)}`, {
   *     headers: authHeader(),
   *   });
   *   if (!res.ok) throw new Error('Impossible de charger l\'historique');
   *   return res.json(); // LignePaiement[]
   */
  async fetchAll(): Promise<LignePaiement[]> {
    await new Promise(r => setTimeout(r, 0));
    return FAKE_DATA;
  },

  /**
   * Exporte les paiements filtrés en CSV (génération client-side).
   * Remplacer par un appel backend si besoin de mise en forme avancée.
   *
   * TODO (backend prêt) :
   *   const res = await fetch(`/paiement/historique/export-csv?${filtresEnParams(filtres)}`, {
   *     headers: authHeader(),
   *   });
   *   const blob = await res.blob();
   *   ... téléchargement blob ...
   */
  async exporterCSV(lignes: LignePaiement[]): Promise<void> {
    const header = 'Date,Employé,Matricule,Département,Jours,Montant,Statut\n';
    const rows   = lignes.map(l =>
      [l.date, l.employe_nom, l.employe_id, l.departement, l.jours, l.montant, l.statut].join(',')
    ).join('\n');
    const blob   = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url    = URL.createObjectURL(blob);
    const a      = Object.assign(document.createElement('a'), { href: url, download: `historique-${Date.now()}.csv` });
    a.click();
    URL.revokeObjectURL(url);
  },

  /**
   * Exporte la liste filtrée en PDF (généré côté serveur).
   * Les conditions de filtres actives sont envoyées en query params.
   *
   * TODO (backend prêt) — décommenter et supprimer le throw :
   *   const res = await fetch(`/paiement/historique/export-pdf?${filtresEnParams(filtres)}`, {
   *     headers: authHeader(),
   *   });
   *   if (!res.ok) throw new Error('Echec export PDF');
   *   const blob = await res.blob();
   *   const url  = URL.createObjectURL(blob);
   *   const a    = Object.assign(document.createElement('a'), {
   *     href:     url,
   *     download: `historique-${Date.now()}.pdf`,
   *   });
   *   a.click();
   *   URL.revokeObjectURL(url);
   *
   * @param filtres  Filtres actifs au moment du clic — transmis tels quels au backend.
   */
  async exporterPDF(filtres: Partial<FiltresState>): Promise<void> {
    // Retire le champ `page` : le PDF exporte toutes les lignes filtrées
    const params = filtresEnParams(filtres);
    console.debug('[historiqueService.exporterPDF] params →', params.toString());
    // TODO: retirer ce throw et décommenter le bloc fetch() ci-dessus
    throw new Error('Export PDF non encore disponible — endpoint backend manquant');
  },

  /**
   * Exporte la fiche PDF d'un seul paiement.
   *
   * TODO (backend prêt) :
   *   GET /paiement/:id/export-pdf → Blob
   */
  async exporterPDFLigne(id: number): Promise<void> {
    throw new Error(`Export PDF #${id} non encore disponible`);
  },
};