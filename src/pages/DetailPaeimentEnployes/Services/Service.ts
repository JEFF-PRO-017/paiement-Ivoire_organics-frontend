import { api, axiosBlob, downloadBlob } from "api/api";
import { Portefeuille, HistoriquePaiement, StatutPortefeuille } from "pages/Utils/types";

export interface PortefeuilleDetail {
  portefeuille: Portefeuille;
  historique:   HistoriquePaiement[];
}

export const portefeuilleService = {

  async fetchDetail(id: number): Promise<PortefeuilleDetail> {
    const portefeuille = await api.get<Portefeuille>(`/portefeuilles/${id}/`);
    const historique   = await api.get<HistoriquePaiement[]>(
      `/portefeuilles/historique/?employe_id=${(portefeuille as any)?.employe?.id}`
    );
    return { portefeuille, historique } as unknown as PortefeuilleDetail;
  },

  async confirmerRH(id: number): Promise<{ statut: StatutPortefeuille }> {
    return api.post(`/portefeuilles/${id}/confirmer-rh/`);
  },

  async marquerPaye(id: number): Promise<{ statut: StatutPortefeuille }> {
    return api.patch(`/portefeuilles/${id}/payer/`);
  },

  async supprimer(id: number): Promise<void> {
    await api.delete(`/portefeuilles/${id}/`);
  },

  async exporterPDF(id: number): Promise<void> {
    const blob = await axiosBlob.get(`/portefeuilles/${id}/export-pdf/`);
    downloadBlob(blob as unknown as Blob, `portefeuille-${id}.pdf`);
  },
};