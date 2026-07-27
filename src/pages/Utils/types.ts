export enum StatutPortefeuille {
  PAYE = 'PAYE',
  IMPAYE = 'IMPAYE',
  CONFIRME_RH = 'CONFIRME_RH',
  EN_ATTENTE = 'EN_ATTENTE',
}

export enum StatutEmploye {
  ACTIF = 'ACTIF',
  INACTIF = 'INACTIF',
}

// export interface Employe {
//   id: number;
//   odoo_id: string;
//   nom_complet: string;
//   departement: string;
//   site_travail: string;
//   statut: StatutEmploye;
// }

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
  somme_totale_en_attente: number;
  somme_totale_impaye: number;
}

export interface HistoriquePaiement {
  id: number;
  date_paiement: string;
  total: number;
  count: number;
}
export interface HistoriquePaiement {
  id: number;
  date_debut: Date;
  date_fin: Date;
  nombre_jours: number;
  montant_total: number;
  statut: StatutPortefeuille;
  periodes_paiement: string[];
  // date_paiement: Date;
}

export interface Paginated<T> {
  results: T[];
  count: number;
  page: number;
  limit: number;
  next: string;
  previous: string;
}
// ................................................................
export interface Employe {
  id: number;
  odoo_id: string;
  nom_complet: string;
  departement: string;
  site_travail: string;
  statut: string;
  mobile_phone: string | null;
  operateur_mobile: string | null;
  notchpay_beneficiary_id: string | null;
}

 export interface AttendanceItem {
  id: number;
  action: string;
  date_work: string; // ISO datetime
  date: string; // ISO date
  worked_hours: number;
  odoo_attendance_id: string;
  date_validation_paiement: string | null;
  statut_paiement: "EN_ATTENTE" | "PAYE" | string;
  statut_attendance: "CREATION_AUTO" | string;
  montant_journalier: string; // décimal renvoyé en string
  employe: number; // id de l'employé
}

export interface EmployeAttendanceGroup {
  employe: Employe;
  attendance_list: AttendanceItem[];
}

interface Pagination {
  count: number;
  page: number;
  page_size: number;
  total_pages: number;
  next: string | null;
  previous: string | null;
}

export interface  Response<T> {
  success: boolean;
  message: string;
  data: T,
  errors: null | Record<string, unknown>;
}
export interface PaginatedResponse<T> {
  success: boolean;
  message: string;
  data: {
    results: T[];
    pagination: Pagination
  };
  errors: null | Record<string, unknown>;
}
export type StatutPaiement = 'EN_ATTENTE' | 'IMPAYE' | 'EN_COURS';


// types.ts — ajoute
export interface PageComponents {
  composant_1: boolean;
  composant_2: boolean;
  composant_3: boolean;
  composant_4?: boolean; // absent sur page_historique (3 composants seulement)
}

export interface UserSettings {
  id: number;
  zoom: boolean;
  mode: 'CLAIR' | 'SOMBRE';
  site: string;
  page_dashboard: PageComponents;
  page_detail: PageComponents;
  page_historique: PageComponents;
}