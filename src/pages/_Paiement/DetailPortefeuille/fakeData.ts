
/*
  ══════════════════════════════════════════════════════════════════
  DONNÉES DE TEST — À supprimer quand les endpoints sont prêts
  ══════════════════════════════════════════════════════════════════
  FAKE_MAP       → simule GET /portefeuilles/:id
  HISTORIQUE_MAP → simule GET /portefeuilles/historique?employe_id=:id

  Toutes les dates sont construites avec new Date() relatif au mois
  courant pour que FullCalendar les affiche immédiatement, comme
  dans le fichier events[] de référence.
  ══════════════════════════════════════════════════════════════════
*/

import { Portefeuille, StatutEmploye, StatutPortefeuille } from "../types";

var date = new Date();
var d = date.getDate();
var m = date.getMonth();
var y = date.getFullYear();
// Références temporelles — même pattern que les events de référence
const now = new Date();   // mois courant (0-indexé)
const mp  = m === 0 ? 11 : m - 1; // mois précédent
const yp  = m === 0 ? y - 1 : y;  // année du mois précédent

// ── Types locaux ─────────────────────────────────────────────────────────────
export interface HistoriquePaiement {
  id:         number;
  date_debut: Date;
  date_fin:   Date;
  jours:      number;
  montant:    number;
  statut:     StatutPortefeuille;

}

// ── Helper : génère les jours ouvrés d'un mois (lun-ven) ─────────────────────
// Retourne les Date[] des jours travaillés sur une plage du mois courant
const joursOuvres = (annee: number, mois: number, debut: number, fin: number): Date[] => {
  const jours: Date[] = [];
  for (let d = debut; d <= fin; d++) {
    const date = new Date(annee, mois, d);
    const dow  = date.getDay();
    if (dow !== 0 && dow !== 6) jours.push(date); // exclut sam et dim
  }
  return jours;
};

// ── Portefeuilles ─────────────────────────────────────────────────────────────
export const FAKE_MAP: Record<number, Portefeuille> = {
  1: {
    id: 1,
    nombre_jours_impayes: 12,
    montant_journalier: 15_000,
    cree_le:    new Date(y, mp, 1).toISOString(),
    modifie_le: new Date(y, m,  1).toISOString(),
    statut:     StatutPortefeuille.EN_ATTENTE,
    employe_id: 1,
    // Jours travaillés du mois courant (1 → 20), ouvrés seulement
    periodes_paiement: joursOuvres(y, m, 1, 20).map(d => d.toISOString().split('T')[0]),
    employe: {
      id:           1,
      odoo_id:      'EMP001',
      nom_complet:  'Jean Dupont',
      departement:  'Comptabilité',
      site_travail: 'Siège',
      statut:       StatutEmploye.ACTIF,
    },

  },

  2: {
    id: 2,
    nombre_jours_impayes: 8,
    montant_journalier: 15_000,
    cree_le:    new Date(y, mp, 5).toISOString(),
    modifie_le: new Date(y, m,  2).toISOString(),
    statut:     StatutPortefeuille.CONFIRME_RH,
    employe_id: 2,
    periodes_paiement: joursOuvres(y, m, 1, 12).map(d => d.toISOString().split('T')[0]),
    employe: {
      id:           2,
      odoo_id:      'EMP002',
      nom_complet:  'Marie Martin',
      departement:  'RH',
      site_travail: 'Annexe B',
      statut:       StatutEmploye.ACTIF,
    },
  },
};

// ── Historique des paiements par employe_id ───────────────────────────────────
/*
  Chaque entrée est une plage date_debut → date_fin affichée dans FullCalendar.
  Dates construites avec new Date(y, m, d) pour coller au mois courant.

  TODO: remplacer par GET /portefeuilles/historique?employe_id=:id
  Réponse attendue : HistoriquePaiement[]
*/
export const HISTORIQUE_MAP: Record<number, HistoriquePaiement[]> = {

  // ── Jean Dupont (EMP001) ────────────────────────────────────────────────────
  1: [
    {
      // Mois précédent — semaine 3 → fin du mois
      id:         101,
      date_debut: new Date(yp, mp, 14),
      date_fin:   new Date(yp, mp, 28),
      jours:      10,
      montant:    150_000,
      statut:     StatutPortefeuille.PAYE,
    },
    {
      // Deux mois avant — début de mois
      id:         89,
      date_debut: new Date(yp, mp - 1 < 0 ? 11 : mp - 1, 3),
      date_fin:   new Date(yp, mp - 1 < 0 ? 11 : mp - 1, 14),
      jours:      8,
      montant:    120_000,
      statut:     StatutPortefeuille.PAYE,
    },
    {
      // Trois mois avant
      id:         74,
      date_debut: new Date(yp, mp - 2 < 0 ? 12 + (mp - 2) : mp - 2, 20),
      date_fin:   new Date(yp, mp - 1 < 0 ? 11 : mp - 1, 2),
      jours:      5,
      montant:    75_000,
      statut:     StatutPortefeuille.PAYE,
    },
    {
      // Quatre mois avant — période impayée
      id:         44,
      date_debut: new Date(yp, mp - 3 < 0 ? 12 + (mp - 3) : mp - 3, 7),
      date_fin:   new Date(yp, mp - 3 < 0 ? 12 + (mp - 3) : mp - 3, 11),
      jours:      4,
      montant:    60_000,
      statut:     StatutPortefeuille.IMPAYE,
    },
  ],

  // ── Marie Martin (EMP002) ───────────────────────────────────────────────────
  2: [
    {
      id:         102,
      date_debut: new Date(yp, mp, 7),
      date_fin:   new Date(yp, mp, 18),
      jours:      9,
      montant:    135_000,
      statut:     StatutPortefeuille.PAYE,
    },
    {
      id:         90,
      date_debut: new Date(yp, mp - 1 < 0 ? 11 : mp - 1, 17),
      date_fin:   new Date(yp, mp - 1 < 0 ? 11 : mp - 1, 28),
      jours:      6,
      montant:    90_000,
      statut:     StatutPortefeuille.PAYE,
    },
  ],
};