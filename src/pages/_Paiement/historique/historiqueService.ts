/*
  historiqueService.ts
  ────────────────────
  GET /paiement/historique/             → liste filtrée
  GET /paiement/historique/export-pdf/  → Blob PDF
  CSV généré côté client
*/

import { api, downloadBlob, axiosBlob } from 'api/api';
import { LignePaiement, FiltresState } from './historique.types';

export type { LignePaiement };

// Sérialise les filtres en query string
const filtresEnParams = (filtres: Partial<FiltresState>): string => {
  const p = new URLSearchParams();
  if (filtres.search)                          p.set('search',     filtres.search);
  if (filtres.dept && filtres.dept !== 'Tous') p.set('dept',       filtres.dept);
  if (filtres.dateRange?.length === 2) {
    p.set('date_debut', filtres.dateRange[0].toISOString());
    p.set('date_fin',   filtres.dateRange[1].toISOString());
  }
  return p.toString();
};

export const historiqueService = {

  async fetchAll(filtres: Partial<FiltresState> = {}): Promise<LignePaiement[]> {
    const { data } = await api.get(`/paiement/historique/?${filtresEnParams(filtres)}`);
    return data;
  },

  // CSV généré côté client — pas d'endpoint back nécessaire
  async exporterCSV(lignes: LignePaiement[]): Promise<void> {
    const header = 'Date,Employé,Matricule,Département,Jours,Montant,Statut\n';
    const rows   = lignes.map(l =>
      [l.date, l.employe_nom, l.employe_id, l.departement, l.jours, l.montant, l.statut].join(',')
    ).join('\n');
    downloadBlob(new Blob([header + rows], { type: 'text/csv;charset=utf-8;' }), `historique-${Date.now()}.csv`);
  },

  // PDF généré côté serveur
  async exporterPDF(filtres: Partial<FiltresState>): Promise<void> {
    const { data } = await axiosBlob.get(`/paiement/historique/export-pdf/?${filtresEnParams(filtres)}`);
    downloadBlob(data, `historique-${Date.now()}.pdf`);
  },

  async exporterPDFLigne(id: number): Promise<void> {
    const { data } = await axiosBlob.get(`/portefeuilles/${id}/export-pdf/`);
    downloadBlob(data, `paiement-${id}.pdf`);
  },
};