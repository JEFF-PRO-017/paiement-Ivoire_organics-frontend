export interface SoldeNotchPay {
  solde: number;
}

export type ModePaiementType = 'AUTOMATIQUE' | 'MANUEL';

export interface ModePaiementInfo {
  mode: ModePaiementType;
  date_changement_mode: string;
  derniere_execution_auto: string | null;
  jours_restants: number | null;
}