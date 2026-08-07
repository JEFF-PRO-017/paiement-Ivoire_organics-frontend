import { api } from 'api/api';
import { SoldeNotchPay, ModePaiementInfo, ModePaiementType } from '../types';

export const settingsAdminService = {
  async getSolde(): Promise<SoldeNotchPay> {
    const res = await api.get('/api/notch-pay/solde-notchpay/');
      console.log('getModePaiement res', res);
    return res.data;
  },

  async getModePaiement(): Promise<ModePaiementInfo> {
    const res = await api.get('/api/notch-pay/config-paiement/');
    return res.data;
  },

  async setModePaiement(mode: ModePaiementType): Promise<ModePaiementInfo> {
    const res = await api.post('/api/notch-pay/config-paiement/', { mode });
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
};