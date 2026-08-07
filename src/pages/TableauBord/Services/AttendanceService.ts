
// ─── Types ────────────────────────────────────────────────────────────────

import { api } from "api/api";
import { CreerPresencePayload, CreerPresenceResponse, STATUT_CHOICES_ATTENDANCE } from "pages/Utils/types";


// ─── Service Attendance ─────────────────────────────────────────────────────

export const attendanceService = {
  /**
   * POST /api/paiements/attendances/
   * Création manuelle par un admin. Le back force statut_attendance='CREATION_MANUELLE'
   * et statut_paiement='EN_COURS_TRAITEMENT' — il faut ensuite appeler
   * mettreAJourStatutPaiement pour la faire basculer en 'EN_ATTENTE'.
   */
  creerPresence: (payload: CreerPresencePayload): Promise<CreerPresenceResponse> =>
    api.post('/api/paiements/attendances/', payload).then(r => r.data),

  /**
   * PATCH /api/paiements/attendances/
   * Réutilise la route bulk existante (update_statut_bulk) pour changer le statut_paiement
   * d'une ou plusieurs attendances (ex: EN_COURS_TRAITEMENT → EN_ATTENTE après création admin).
   */
  mettreAJourStatutPaiement: (ids: number[], statut_paiement:STATUT_CHOICES_ATTENDANCE ) =>
    api.patch('/api/paiements/attendances/', { ids, statut_paiement }).then(r => r.data),

  
  payementManuel: (): Promise<any> =>
    api.post('/api/notch-pay/paiement-manuel/', {'employe_ids': [2]}).then(r => r.data),

};

// ─── Service Signalement ────────────────────────────────────────────────────

