// SettingsService.ts
import { AxiosRequestConfig } from "axios";
import { api } from "api/api";
import { UserSettings } from "pages/Utils/types";

export const settingsService = {
  async getSettings(): Promise<UserSettings> {
    // L'interceptor global déballe déjà l'enveloppe { success, data, ... },
    // la réponse EST directement les settings — pas res.data.data
    return api.get('/api/front_settings/settings/') as unknown as Promise<UserSettings>;
  },

  async patchSettings(
    partial: Partial<UserSettings>,
    config?: AxiosRequestConfig,
  ): Promise<UserSettings> {
    // Ne plus avaler l'erreur ici : on laisse l'appelant décider (rollback,
    // toast global via loadingService, etc.). C'est le rôle de l'interceptor,
    // pas du service.
    return api.patch('/api/front_settings/settings/', partial, { silentLoading: true, silentSuccess: true } as any) as unknown as Promise<UserSettings>;
  },
};