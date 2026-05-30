/*
  portefeuilleService.ts
  ──────────────────────
  GET    /portefeuilles/:id/
  GET    /portefeuilles/historique/?employe_id=
  POST   /portefeuilles/:id/confirmer-rh/
  PATCH  /portefeuilles/:id/payer/
  DELETE /portefeuilles/:id/
  GET    /portefeuilles/:id/export-pdf/  → Blob
*/

import { api, axiosBlob, downloadBlob } from "api/api";
import { Portefeuille, HistoriquePaiement, StatutPortefeuille } from "pages/Utils/types";



export interface PortefeuilleDetail {
  portefeuille: Portefeuille;
  historique:   HistoriquePaiement[];
}

export const portefeuilleService = {

  async fetchDetail(id: number): Promise<PortefeuilleDetail> {
    const { data: portefeuille } = await api.get<Portefeuille>(`/portefeuilles/${id}/`);
    const { data: historique }   = await api.get<HistoriquePaiement[]>(
      `/portefeuilles/historique/?employe_id=${portefeuille?.employe?.id}`
    );
    return { portefeuille, historique };
  },

  async confirmerRH(id: number): Promise<{ statut: StatutPortefeuille }> {
    const { data } = await api.post(`/portefeuilles/${id}/confirmer-rh/`);
    return data;
  },

  async marquerPaye(id: number): Promise<{ statut: StatutPortefeuille }> {
    const { data } = await api.patch(`/portefeuilles/${id}/payer/`);
    return data;
  },

  async supprimer(id: number): Promise<void> {
    await api.delete(`/portefeuilles/${id}/`);
  },

  async exporterPDF(id: number): Promise<void> {
    const { data } = await axiosBlob.get(`/portefeuilles/${id}/export-pdf/`);
    downloadBlob(data, `portefeuille-${id}.pdf`);
  },
};