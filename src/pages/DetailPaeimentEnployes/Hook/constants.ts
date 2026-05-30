import { StatutPortefeuille } from "pages/Utils/types";

export const STATUT_CLR: Record<StatutPortefeuille, string> = {
  [StatutPortefeuille.PAYE]:        'success',
  [StatutPortefeuille.CONFIRME_RH]: 'primary',
  [StatutPortefeuille.EN_ATTENTE]:  'warning',
  [StatutPortefeuille.IMPAYE]:      'danger',
};

export const STATUT_ORDER: StatutPortefeuille[] = [
  StatutPortefeuille.EN_ATTENTE,
  StatutPortefeuille.CONFIRME_RH,
  StatutPortefeuille.IMPAYE,
  StatutPortefeuille.PAYE,
];
