import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { settingsAdminService } from '../Services/SettingsAdminService';

import { ModePaiementInfo, ModePaiementType } from '../types';
import { getAuthTokens, getUser, setUser } from 'pages/Authentication/utilis';
import { settingsService } from 'pages/TableauBord/Services/SettingsService';

export const useSettingsAdmin = () => {
  // ── Solde NotchPay ─────────────────────────────────────────────────────
  const [showSolde, setShowSolde] = useState(false);
  const [solde, setSolde] = useState<number | null>(null);
  const [loadingSolde, setLoadingSolde] = useState(false);

  // Affiche/masque le solde ; charge la valeur seulement au premier affichage
  const toggleSolde = useCallback(async () => {
    if (!showSolde && solde === null) {
      setLoadingSolde(true);
      try {
        const data = await settingsAdminService.getSolde();
        setSolde(data.solde);
      } catch {
        toast.error('Impossible de charger le solde');
      } finally {
        setLoadingSolde(false);
      }
    }
    setShowSolde(v => !v);
  }, [showSolde, solde]);

  // ── Mode de paiement ───────────────────────────────────────────────────
  const [modeInfo, setModeInfo] = useState<ModePaiementInfo | null>(null);
  const [loadingMode, setLoadingMode] = useState(true);

  // Charge le mode actuel au montage
  useEffect(() => {
    console.log('useSettingsAdmin: loading mode de paiement...');
    settingsAdminService.getModePaiement()
      .then((r) => {
        console.log('modeInfo', r);
        setModeInfo(r)
      })
      .catch(() => toast.error('Impossible de charger le mode de paiement'))
      .finally(() => setLoadingMode(false));
  }, []);

  // Bascule AUTOMATIQUE <-> MANUEL
  const changeMode = useCallback(async (mode: ModePaiementType) => {
    setLoadingMode(true);
    try {
      const data = await settingsAdminService.setModePaiement(mode);
      setModeInfo(data);
      toast.success(`Mode ${data.mode} activé`);
    } catch {
      toast.error('Impossible de changer le mode de paiement');
    } finally {
      setLoadingMode(false);
    }
  }, []);

  // ── Site actif ─────────────────────────────────────────────────────────
  const user = getUser();
  const sites = getAuthTokens()?.sites ?? [];
  const activeSite = user?.setting?.site ?? null;
  const [changingSite, setChangingSite] = useState(false);

  // Change le site, met à jour le cache local, puis force un reload complet
  // (nécessaire car tout le dashboard dépend du site actif chargé au démarrage)
  const changeSite = useCallback(async (site: string) => {
    if (site === activeSite) return;
    setChangingSite(true);
    try {
      await settingsService.patchSettings({ site });
      const current = getUser();
      if (current) setUser({ ...current, setting: { ...current.setting, site } });
      // window.location.reload();
    } catch {
      toast.error('Impossible de changer de site');
    } finally {
      setChangingSite(false);
    }
  }, [activeSite]);

  // ── Odoo (présences) ───────────────────────────────────────────────────
  // Un seul flag pour verrouiller toute la section pendant un traitement long
  const [odooLoading, setOdooLoading] = useState(false);

  const loadEmployees = useCallback(async () => {
    setOdooLoading(true);
    try {
      await settingsAdminService.loadEmployees();
      toast.success('Employés rechargés avec succès');
    } catch {
      toast.error('Échec du rechargement des employés');
    } finally {
      setOdooLoading(false);
    }
  }, []);

  const loadAttendances = useCallback(async (days: number) => {
    setOdooLoading(true);
    try {
      await settingsAdminService.loadAttendances(days);
      toast.success('Présences relancées avec succès');
    } catch {
      toast.error('Échec du rechargement des présences');
    } finally {
      setOdooLoading(false);
    }
  }, []);

  return {
    showSolde, solde, loadingSolde, toggleSolde,
    modeInfo, loadingMode, changeMode,
    sites, activeSite, changingSite, changeSite,
    odooLoading, loadEmployees, loadAttendances,
  };
};