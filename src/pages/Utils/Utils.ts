export const fmt     = (n: number) => n?(n.toLocaleString('fr-FR') + ' FCF'): '0 FCF';
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
