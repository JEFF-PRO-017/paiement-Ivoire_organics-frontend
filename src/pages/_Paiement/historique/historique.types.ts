/*
  ══════════════════════════════════════════════════════════════════
  historique.types.ts
  ══════════════════════════════════════════════════════════════════
  Types partagés entre le service, le hook et les composants.
  ══════════════════════════════════════════════════════════════════
*/

import { StatutPortefeuille } from '../types';

export interface LignePaiement {
  id:          number;
  date:        string;
  employe_nom: string;
  employe_id:  string;
  departement: string;
  jours:       number;
  montant:     number;
  statut:      StatutPortefeuille;
}

export interface StatsHistorique {
  total:    number;
  count:    number;
  moyenne:  number;
  employes: number;
}

export interface FiltresState {
  search:     string;
  dept:       string;
  dateRange:  Date[];
  activeChip: string;
  page:       number;
}