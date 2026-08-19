import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { DashboardStats, HistoriquePaiement, EmployeAttendanceGroup, PaginatedResponse, PageComponents, StatutPaiement } from '../../Utils/types';
import { paiementService } from '../Services/Service';
import { settingsService } from '../Services/SettingsService';
import { getUser, setUser } from 'pages/Authentication/utilis';

export type SectionKey = 's1' | 's2' | 's3' | 's4';

// correspondance entre les clés du front (s1..s4) et les clés du back (composant_1..composant_4)
const KEY_TO_COMPOSANT: Record<SectionKey, keyof PageComponents> = {
  s1: 'composant_1', s2: 'composant_2', s3: 'composant_3', s4: 'composant_4',
};

/** Gère les données paginées d'un statut d'attendance (EN_ATTENTE, IMPAYE...). */
const usePaginatedAttendances = (
  statut: StatutPaiement,
  onFirstLoad: () => void,
  errorMessage: string,
) => {
  const [data, setData] = useState<PaginatedResponse<EmployeAttendanceGroup> | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchData = useCallback(
    (p: number, size: number) => paiementService.getAttendances(statut, p, size).then(setData),
    [statut],
  );

  useEffect(() => {
    fetchData(1, 5).then(onFirstLoad).catch(() => toast.error(errorMessage));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePage = useCallback((p: number) => { setPage(p); fetchData(p, pageSize); }, [fetchData, pageSize]);

  const handlePageSize = useCallback((size: number) => {
    setPageSize(size);
    setPage(1);
    fetchData(1, size);
  }, [fetchData]);

  const refetch = useCallback(() => fetchData(page, pageSize), [fetchData, page, pageSize]);
  console.log('data',data)

  return { data, page, pageSize, handlePage, handlePageSize, refetch };
};

export const useDashboard = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [jours, setJours] = useState<string[]>([]);
  const [historique, setHistorique] = useState<HistoriquePaiement[]>([]);

  // Initialise l'affichage à partir des préférences déjà connues (localStorage),
  // pour éviter un flash "tout masqué" avant la réponse des fetchs de données.
  const [visible, setVisible] = useState<Record<SectionKey, boolean | null>>(() => {
    const saved = getUser()?.setting?.page_dashboard;
    return {
      s1: saved?.composant_1 ?? null,
      s2: saved?.composant_2 ?? null,
      s3: saved?.composant_3 ?? null,
      s4: saved?.composant_4 ?? null,
    };
  });

  

  // Met à jour la visibilité localement, puis persiste en silence côté back
  const setVisibility = useCallback(
    (key: SectionKey, value: boolean | ((prev: boolean | null) => boolean)) => {
      setVisible(v => ({
        ...v,
        [key]: typeof value === 'function' ? (value as (p: boolean | null) => boolean)(v[key]) : value,
      }));
    },
    [],
  );

  // Effet séparé : persiste `visible` en back, avec debounce anti-clics rapides.
  // isUserAction distingue un clic utilisateur (show()/hide()/toggle() appelés depuis l'UI)
  // d'un changement programmatique (show() déclenché automatiquement au premier chargement des données),
  // pour éviter d'envoyer un PATCH inutile au montage.
  const isUserAction = useRef(false);

  useEffect(() => {
    if (!isUserAction.current) return;
    isUserAction.current = false;

    const timeout = setTimeout(() => {
      const patch = {
        composant_1: visible.s1 ?? true,
        composant_2: visible.s2 ?? true,
        composant_3: visible.s3 ?? true,
        composant_4: visible.s4 ?? true,
      };
      settingsService.patchSettings({ page_dashboard: patch }).then(() => {
        // resynchronise le cache local pour éviter une valeur périmée au prochain montage
        const user = getUser();
        if (user) setUser({ ...user, setting: { ...user.setting, page_dashboard: patch } });
      });
    }, 500); // debounce : n'envoie qu'après 500ms d'inactivité

    return () => clearTimeout(timeout); // annule le patch précédent si un nouveau toggle arrive avant
  }, [visible]);

  const show = useCallback((key: SectionKey) => setVisibility(key, true), [setVisibility]);

  const hide = useCallback((key: SectionKey) => {
    isUserAction.current = true;
    setVisibility(key, false);
  }, [setVisibility]);

  const toggle = useCallback((key: SectionKey) => {
    isUserAction.current = true;
    setVisibility(key, v => !v);
  }, [setVisibility]);

  // Section "portefeuilles en attente" — ne force "show" que si l'utilisateur n'a pas déjà masqué la section
  const enAttente = usePaginatedAttendances('EN_ATTENTE', () => visible.s3 === null && show('s3'), 'Impossible de charger les portefeuilles EN_ATTENTE');
  const impayes = usePaginatedAttendances('IMPAYE', () => visible.s4 === null && show('s4'), 'Impossible de charger les portefeuilles IMPAYÉS');

  useEffect(() => {
    paiementService.getStats()
      .then(d => { setStats(d.data); visible.s1 === null && show('s1'); })
      .catch(() => toast.error('Impossible de charger les statistiques'));

    Promise.all([paiementService.getJoursCumules(), paiementService.getHistorique(3)])
      .then(([j, h]) => { setJours(j.data); setHistorique(h.data); visible.s2 === null && show('s2'); })
      .catch(() => toast.error('Impossible de charger le calendrier'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConfirmerRH = useCallback(async (ids: number[]) => {
    await paiementService.confirmerRH(ids);
    toast.success(`${ids.length} portefeuille(s) confirmé(s)`);
    enAttente.refetch();
    impayes.refetch();
    paiementService.getStats()
      .then(d => { setStats(d.data); visible.s1 === null && show('s1'); })
      .catch(() => toast.error('Impossible de charger les statistiques'));  }, [enAttente.refetch, impayes.refetch]);
  const allHidden = Object.values(visible).every(v => v === false);

  return {
    stats, jours, historique,
    enAttente: enAttente.data, impayes: impayes.data,
    pageEA: enAttente.page, pageSizeEA: enAttente.pageSize,
    pageIMP: impayes.page, pageSizeIMP: impayes.pageSize,
    visible, toggle, hide,
    allHidden,
    handlePageEA: enAttente.handlePage, handlePageSizeEA: enAttente.handlePageSize,
    handlePageIMP: impayes.handlePage, handlePageSizeIMP: impayes.handlePageSize,
    handleConfirmerRH,
    // exposés pour rafraîchir les tableaux depuis ModalDetailEmploye après création/archivage d'une présence
    refetchEA: enAttente.refetch,
    refetchIMP: impayes.refetch,
  };
};