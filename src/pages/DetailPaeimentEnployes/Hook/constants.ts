import { StatutPortefeuille } from "pages/Utils/types";

export const STATUT_CLR: Record<StatutPortefeuille, string> = {
  [StatutPortefeuille.PAYE]: 'success',
  [StatutPortefeuille.CONFIRME_RH]: 'primary',
  [StatutPortefeuille.EN_ATTENTE]: 'warning',
  [StatutPortefeuille.IMPAYE]: 'danger',
  [StatutPortefeuille.ARCHIVE]: 'secondary',
  [StatutPortefeuille.EN_COURS_TRAITEMENT_CREATION]: 'purple',
  [StatutPortefeuille.EN_COURS_TRAITEMENT_SUPPRESION]: 'purple',
};

export const STATUT_ORDER: StatutPortefeuille[] = [
  StatutPortefeuille.EN_ATTENTE,
  StatutPortefeuille.CONFIRME_RH,
  StatutPortefeuille.IMPAYE,
  StatutPortefeuille.PAYE,
];
export const STATUT_COLOR: Record<string, string> = {
  EN_ATTENTE: 'warning',
  IMPAYE: 'danger',
  EN_COURS: 'info',
  PAYE: 'success',
  EN_COURS_TRAITEMENT: 'secondary', // ⚠️ nécessite .bg-purple-subtle / .text-purple définis en CSS global
  EN_COURS_TRAITEMENT_CREATION:'secondary',
  EN_COURS_TRAITEMENT_SUPPRESION:'secondary',
};