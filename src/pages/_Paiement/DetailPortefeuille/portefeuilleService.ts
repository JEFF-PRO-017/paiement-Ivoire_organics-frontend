/*
  ══════════════════════════════════════════════════════════════════
  portefeuilleService.ts
  ══════════════════════════════════════════════════════════════════
  Couche data centralisée pour le module "Détail Portefeuille".

  POUR CONNECTER LE BACKEND :
    1. Supprimer l'import FAKE_MAP / HISTORIQUE_MAP
    2. Décommenter les blocs fetch() dans chaque méthode
    3. Ajuster les URLs selon votre base path API
  ══════════════════════════════════════════════════════════════════
*/

import { Portefeuille, StatutPortefeuille } from '../types';
import { FAKE_MAP, HISTORIQUE_MAP, HistoriquePaiement } from './fakeData';

// ── Helpers internes ─────────────────────────────────────────────────────────

/** Récupère le token depuis le localStorage (à remplacer par votre auth store). */
const authHeader = (): HeadersInit => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`,
});

// ── Types retournés par le service ────────────────────────────────────────────

export interface PortefeuilleDetail {
  portefeuille: Portefeuille;
  historique:   HistoriquePaiement[];
}

// ── Service ───────────────────────────────────────────────────────────────────

export const portefeuilleService = {

  /**
   * Charge un portefeuille et l'historique de paiements de son employé.
   *
   * TODO (backend prêt) :
   *   const [pfRes, histRes] = await Promise.all([
   *     fetch(`/portefeuilles/${id}`,                                { headers: authHeader() }),
   *     fetch(`/portefeuilles/historique?employe_id=${employeId}`,   { headers: authHeader() }),
   *   ]);
   *   if (!pfRes.ok) throw new Error('Portefeuille introuvable');
   *   const portefeuille: Portefeuille        = await pfRes.json();
   *   const historique:   HistoriquePaiement[] = await histRes.json();
   *   return { portefeuille, historique };
   */
  async fetchDetail(id: number): Promise<PortefeuilleDetail> {
    await new Promise(r => setTimeout(r, 0)); // tick async — garder pour la transition API

    const portefeuille = FAKE_MAP[id];
    if (!portefeuille) throw new Error(`Portefeuille #${id} introuvable`);

    const historique = HISTORIQUE_MAP[portefeuille.employe_id] ?? [];
    return { portefeuille, historique };
  },

  /**
   * Confirme le portefeuille côté RH (après vérification empreinte).
   *
   * TODO (backend prêt) :
   *   const res = await fetch(`/portefeuilles/${id}/confirmer-rh`, {
   *     method:  'POST',
   *     headers: authHeader(),
   *   });
   *   if (!res.ok) throw new Error('Echec confirmation RH');
   *   return res.json(); // { statut: 'CONFIRME_RH', modifie_le: string }
   */
  async confirmerRH(id: number): Promise<{ statut: StatutPortefeuille }> {
    await new Promise(r => setTimeout(r, 600));
    return { statut: StatutPortefeuille.CONFIRME_RH };
  },

  /**
   * Marque le portefeuille comme payé (après vérification empreinte).
   *
   * TODO (backend prêt) :
   *   const res = await fetch(`/portefeuilles/${id}/payer`, {
   *     method:  'PATCH',
   *     headers: authHeader(),
   *     body:    JSON.stringify({}),
   *   });
   *   if (!res.ok) throw new Error('Echec marquage paiement');
   *   return res.json(); // { statut: 'PAYE', modifie_le: string }
   */
  async marquerPaye(id: number): Promise<{ statut: StatutPortefeuille }> {
    await new Promise(r => setTimeout(r, 600));
    return { statut: StatutPortefeuille.PAYE };
  },

  /**
   * Supprime (réinitialise) un portefeuille.
   *
   * TODO (backend prêt) :
   *   const res = await fetch(`/portefeuilles/${id}`, {
   *     method:  'DELETE',
   *     headers: authHeader(),
   *   });
   *   if (!res.ok) throw new Error('Echec suppression');
   *   // 204 No Content → pas de body
   */
  async supprimer(id: number): Promise<void> {
    await new Promise(r => setTimeout(r, 600));
  },

  /**
   * Exporte la fiche PDF d'un portefeuille.
   *
   * TODO (backend prêt) :
   *   const res = await fetch(`/portefeuilles/${id}/export-pdf`, { headers: authHeader() });
   *   if (!res.ok) throw new Error('Echec export PDF');
   *   const blob = await res.blob();
   *   const url  = URL.createObjectURL(blob);
   *   const a    = document.createElement('a');
   *   a.href     = url;
   *   a.download = `portefeuille-${id}.pdf`;
   *   a.click();
   *   URL.revokeObjectURL(url);
   */
  async exporterPDF(id: number): Promise<void> {
    // TODO: implémenter quand l'endpoint est disponible
    throw new Error('Export PDF non encore disponible');
  },
};