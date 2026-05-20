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
  employe__nom_complet: string;
  employe__id:  string;
  employe__departement: string;
  nombre_jours:       number;
  montant_total:     number;
  portefeuille__statut:      StatutPortefeuille;
  portefeuille__id:          number;
  date_paiement: string;
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