/*
  ══════════════════════════════════════════════════════════════════
  historique.constants.ts
  ══════════════════════════════════════════════════════════════════
*/

import { StatutPortefeuille } from '../../Utils/types';

export const DEPTS = ['Tous', 'Comptabilité', 'RH', 'Technique', 'Production', 'Finance', 'Logistique'];

export const CHIPS = ["Aujourd'hui", '7 derniers jours', '30 jours', 'Ce mois', 'Trimestre', 'Cette année'];

export const PAGE_LIMIT = 5;

export const STATUT_CLR: Record<StatutPortefeuille, string> = {
  [StatutPortefeuille.PAYE]:        'success',
  [StatutPortefeuille.CONFIRME_RH]: 'primary',
  [StatutPortefeuille.EN_ATTENTE]:  'warning',
  [StatutPortefeuille.IMPAYE]:      'danger',
};

// ── Formatters ────────────────────────────────────────────────────────────────



/** Calcule la plage [from, now] selon le chip sélectionné. */
export const chipToDateRange = (chip: string): [Date, Date] => {
  const now  = new Date();
  const from = new Date();
  if      (chip === "Aujourd'hui")      from.setHours(0, 0, 0, 0);
  else if (chip === '7 derniers jours') from.setDate(now.getDate() - 7);
  else if (chip === '30 jours')         from.setDate(now.getDate() - 30);
  else if (chip === 'Ce mois')          from.setDate(1);
  else if (chip === 'Trimestre')        from.setMonth(now.getMonth() - 3);
  else if (chip === 'Cette année')      from.setMonth(0, 1);
  return [from, now];
};