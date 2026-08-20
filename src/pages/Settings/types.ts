
export type ModePaiementType = 'AUTOMATIQUE' | 'MANUEL';

export interface ModePaiementInfo {
  mode: ModePaiementType;
  date_changement_mode: string;
  derniere_execution_auto: string | null;
  jours_restants: number | null;
}

interface SoldeItem {
  country: string;   // code ISO 3166-1 alpha-3, ex: "GAB", "CMR", "CIV"
  balance: string;   // string numérique, ex: "10000", "9984.7"
  currency: string;  // code devise, ex: "XAF", "XOF", "USD"
  provider: string;
}

 export interface SoldeData {
  solde: SoldeItem[];
}