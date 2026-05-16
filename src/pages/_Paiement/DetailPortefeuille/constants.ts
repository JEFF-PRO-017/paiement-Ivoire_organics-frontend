import { StatutPortefeuille } from '../types';

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

export const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });