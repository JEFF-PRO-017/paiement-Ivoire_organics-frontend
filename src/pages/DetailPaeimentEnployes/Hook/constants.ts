import { StatutPortefeuille } from "pages/Utils/types";

export const STATUT_CLR: Record<StatutPortefeuille, string> = {
  [StatutPortefeuille.PAYE]: 'success',
  [StatutPortefeuille.CONFIRME_RH]: 'primary',
  [StatutPortefeuille.EN_ATTENTE]: 'warning',
  [StatutPortefeuille.IMPAYE]: 'danger',
  [StatutPortefeuille.ARCHIVE]: 'secondary',
  [StatutPortefeuille.EN_COURS_TRAITEMENT_CREATION]: 'secondary',
  [StatutPortefeuille.EN_COURS_TRAITEMENT_SUPPRESION]: 'secondary',
};

export const STATUT_ORDER: StatutPortefeuille[] = [
  StatutPortefeuille.EN_ATTENTE,
  StatutPortefeuille.CONFIRME_RH,
  StatutPortefeuille.IMPAYE,
  StatutPortefeuille.PAYE,
];
