import { api } from "api/api";
import { SignalementPayload, SignalementResponse } from "pages/Utils/types";

export const signalementService = {
  /**
   * POST /api/paiements/signalements/
   * Envoi d'un signalement par un utilisateur non-admin (création/suppression de présence).
   * Le back crée le Signalement, crée/flag l'attendance en EN_COURS_TRAITEMENT et envoie le mail.
   */
  envoyer: (payload: SignalementPayload): Promise<SignalementResponse> =>
    api.post('/api/paiements/signalements/', payload).then(r => r.data),
};