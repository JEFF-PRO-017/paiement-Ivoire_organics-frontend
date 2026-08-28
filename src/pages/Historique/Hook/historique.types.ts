/*
  ══════════════════════════════════════════════════════════════════
  historique.types.ts
  ══════════════════════════════════════════════════════════════════
  Types partagés entre le service, le hook et les composants.
  ══════════════════════════════════════════════════════════════════
*/

import { AttendanceItem, Employe } from '../../Utils/types';

type StatutPaiement = 'ENCOURS' | 'SUCCESS' | 'FAILED';
type MethodePaiement = 'ORANGE_CIV' | 'MTN_MOMO_CIV';
type TypePaiement = 'GROUPE' | 'AUTOMATIQUE' | 'DEMANDE';


interface ReponseBrute {
  status: string;
  created: string;
  payoutId: string;
  [key: string]: unknown; // au cas où PawaPay renvoie des champs additionnels
}
export interface Paiement {
  id: number;
  employe: Employe;
  date_paiement: string; // format "YYYY-MM-DD"
  attendances: AttendanceItem[];
  statut: StatutPaiement;
  montant: string; // DecimalField → string côté DRF par défaut
  phone_number: string;
  methode_paiement: MethodePaiement;
  type_paiement: TypePaiement;
  reference: string;
  reponse_brute: ReponseBrute | null;
  date_envoi: string | null; // ISO datetime
  date_confirmation: string | null; // ISO datetime
}

export interface StatsHistorique {
  total: number;
  count: number;
  moyenne: number;
  employes: number;
}

export interface FiltresState {
  search: string;
  dept: string;
  dateRange: Date[];
  activeChip: string;
  page: number;
  pageSize?: number
}