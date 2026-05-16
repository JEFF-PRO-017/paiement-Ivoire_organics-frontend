export enum StatutPortefeuille {
  PAYE        = 'PAYE',
  IMPAYE      = 'IMPAYE',
  CONFIRME_RH = 'CONFIRME_RH',
  EN_ATTENTE  = 'EN_ATTENTE',
}

export enum StatutEmploye {
  ACTIF   = 'ACTIF',
  INACTIF = 'INACTIF',
}

export interface Employe {
  id: number;
  odoo_id: string;
  nom_complet: string;
  departement: string;
  site_travail: string;
  statut: StatutEmploye;
}

export interface Portefeuille {
  id: number;
  nombre_jours_impayes: number;
  montant_journalier: number;
  cree_le: string;
  modifie_le: string;
  statut: StatutPortefeuille;
  employe_id: number;
  employe?: Employe;
  periodes_paiement?: string[];
  title?: string;
  start?: Date;
  end?: Date;
  allDay?: boolean;
  className?: string;
  location?: string;
}

export interface DashboardStats {
  nombre_employes: number;
  total_jours_cumules: number;
  somme_totale_a_payer: number;
}

export interface HistoriquePaiement {
  id: number;
  date_paiement: string;
  montant_total: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}