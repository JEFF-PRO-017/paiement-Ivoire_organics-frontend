// SettingsService.ts

import { api } from "api/api";
import { UserSettings } from "pages/Utils/types";


export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    const res = await api.get('/api/front_settings/settings/');
    return res.data.data;
  },

  // Mise à jour partielle silencieuse : pas de toast/erreur bloquante,
  // c'est un enregistrement en arrière-plan des préférences d'affichage
  async patchSettings(partial: Partial<UserSettings>): Promise<void> {
    try {
      await api.patch('/api/front_settings/settings/', partial);
    } catch {
      // volontairement silencieux : ne doit jamais perturber l'UI
    }
  },
};