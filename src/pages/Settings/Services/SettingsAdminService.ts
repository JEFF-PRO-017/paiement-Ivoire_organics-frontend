import { api } from 'api/api';
import {  ModePaiementInfo, ModePaiementType, SoldeData } from '../types';

export const settingsAdminService = {
  async getSolde(): Promise<SoldeData> {
    const res = await api.get('/api/pawa_pay/solde_pawapay/');
      console.log('getModePaiement res', res);
    return res.data;
  },

  async getModePaiement(): Promise<ModePaiementInfo> {
    const res = await api.get('/api/pawa_pay/config_paiement/');
    return res.data;
  },

  async setModePaiement(mode: ModePaiementType): Promise<ModePaiementInfo> {
    const res = await api.post('/api/pawa_pay/config_paiement/', { mode });
    return res.data;
  },

  // Pas de payload attendu en retour : succès = employés rechargés côté back
  async loadEmployees(): Promise<void> {
    await api.post('/api/odoo_attendance/load-employees/');
  },

  async loadAttendances(daysInitialAttendance: number): Promise<void> {
    await api.post('/api/odoo_attendance/load-attendances/', {
      days_initial_attendance: daysInitialAttendance,
    });
  },
  async verifierPaiementsEnCours ():Promise<void> {
     return await api.get('api/pawa_pay/verifier_en_cours/').then(res => res.data)
  }

};