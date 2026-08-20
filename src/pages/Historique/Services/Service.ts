import { api, downloadBlob, axiosBlob } from 'api/api';
import {  FiltresState, Paiement, StatsHistorique } from '../Hook/historique.types';
import { PaginatedResponse } from 'pages/Utils/types';



const filtresEnParams = (
  filtres: Partial<FiltresState>,
  page     = 1,
  pageSize = 10,
): string => {
  const p = new URLSearchParams();

  if (filtres.search)                          p.set('search',    filtres.search);
  if (filtres.dept && filtres.dept !== 'Tous') p.set('dept',      filtres.dept);
  if (filtres.dateRange?.length === 2) {
    p.set('date_debut', filtres.dateRange[0].toISOString().split('T')[0]);
    p.set('date_fin',   filtres.dateRange[1].toISOString().split('T')[0]);
  }

  p.set('page',      String(page));
  p.set('page_size', String(pageSize));

  return p.toString();
};

export const historiqueService = {

  async fetchPage(
    filtres:  Partial<FiltresState> = {},
    page     = 1,
    pageSize = 10,
  ): Promise<PaginatedResponse<Paiement>> {
    return api.get(`api/paiements/historique/?${filtresEnParams(filtres, page, pageSize)}`);
  },

  async exporterCSV(lignes: Paiement[]): Promise<void> {
    const header = 'Date,Employé,Matricule,Département,Jours,Montant,Statut\n';
    const rows   = lignes.map(l =>
      [
        l.date_paiement, l.employe.nom_complet, l.employe.id,
        l.employe.departement, l.attendances.length, l.montant,
        l.statut,
      ].join(',')
    ).join('\n');
    downloadBlob(
      new Blob([header + rows], { type: 'text/csv;charset=utf-8;' }),
      `historique-${Date.now()}.csv`,
    );
  },

  async exporterPDF(filtres: Partial<FiltresState>): Promise<void> {
    const blob = await axiosBlob.get(
      `api/paiements/historique/export-pdf/?${filtresEnParams(filtres)}`
    );
    downloadBlob(blob as unknown as Blob, `historique-${Date.now()}.pdf`);
  },

  async exporterPDFLigne(id: number): Promise<void> {
    const blob = await axiosBlob.get(`api/paiements/historique/export-pdf/`);
    downloadBlob(blob as unknown as Blob, `paiement-${id}.pdf`);
  },
};