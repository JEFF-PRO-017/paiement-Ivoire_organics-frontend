import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { paiementService } from './paiementService';
import { DashboardStats, HistoriquePaiement, Paginated, Portefeuille } from './types';

export type SectionKey = 's1' | 's2' | 's3' | 's4';

export const useDashboard = () => {
  const [stats,      setStats]      = useState<DashboardStats | null>(null);
  const [jours,      setJours]      = useState<string[]>([]);
  const [historique, setHistorique] = useState<HistoriquePaiement[]>([]);
  const [enAttente,  setEnAttente]  = useState<Paginated<Portefeuille> | null>(null);
  const [impayes,    setImpayes]    = useState<Paginated<Portefeuille> | null>(null);

  const [pageEA,     setPageEA]     = useState(1);
  const [pageIMP,    setPageIMP]    = useState(1);
  const [pageSizeEA,  setPageSizeEA]  = useState(5);
  const [pageSizeIMP, setPageSizeIMP] = useState(5);

  // visible: null = pas encore reçu, true/false = affiché/masqué
  const [visible, setVisible] = useState<Record<SectionKey, boolean | null>>({
    s1: null, s2: null, s3: null, s4: null,
  });

  const show   = useCallback((key: SectionKey) => setVisible(v => ({ ...v, [key]: true })),  []);
  const hide   = useCallback((key: SectionKey) => setVisible(v => ({ ...v, [key]: false })), []);
  const toggle = useCallback((key: SectionKey) => setVisible(v => ({ ...v, [key]: !v[key] })), []);

  // Chargements décalés — section apparaît à la réception de ses données
  useEffect(() => {
    paiementService.getStats()
      .then(d => { setStats(d); show('s1'); })
      .catch(() => toast.error('Impossible de charger les statistiques'));

    Promise.all([paiementService.getJoursCumules(), paiementService.getHistorique(3)])
      .then(([j, h]) => { setJours(j); setHistorique(h); show('s2'); })
      .catch(() => toast.error('Impossible de charger le calendrier'));

    paiementService.getEnAttente(1, 5)
      .then(d => { setEnAttente(d); show('s3'); })
      .catch(() => toast.error('Impossible de charger les portefeuilles EN_ATTENTE'));

    paiementService.getImpayes(1, 5)
      .then(d => { setImpayes(d); show('s4'); })
      .catch(() => toast.error('Impossible de charger les portefeuilles IMPAYÉS'));
  }, []);

  // ── EN_ATTENTE ────────────────────────────────────────────────────────────

  const handlePageEA = useCallback((p: number) => {
    setPageEA(p);
    paiementService.getEnAttente(p, pageSizeEA).then(setEnAttente);
  }, [pageSizeEA]);

  const handlePageSizeEA = useCallback((size: number) => {
    setPageSizeEA(size);
    setPageEA(1);
    paiementService.getEnAttente(1, size).then(setEnAttente);
  }, []);

  // ── IMPAYÉS ───────────────────────────────────────────────────────────────

  const handlePageIMP = useCallback((p: number) => {
    setPageIMP(p);
    paiementService.getImpayes(p, pageSizeIMP).then(setImpayes);
  }, [pageSizeIMP]);

  const handlePageSizeIMP = useCallback((size: number) => {
    setPageSizeIMP(size);
    setPageIMP(1);
    paiementService.getImpayes(1, size).then(setImpayes);
  }, []);

  // ── Confirmation RH ───────────────────────────────────────────────────────

  const handleConfirmerRH = useCallback(async (ids: number[]) => {
    await paiementService.confirmerRH(ids);
    toast.success(`${ids.length} portefeuille(s) confirmé(s)`);
    paiementService.getEnAttente(pageEA,  pageSizeEA).then(setEnAttente);
    paiementService.getImpayes(pageIMP, pageSizeIMP).then(setImpayes);
  }, [pageEA, pageSizeEA, pageIMP, pageSizeIMP]);

  const allHidden = Object.values(visible).every(v => v === false);

  return {
    stats, jours, historique,
    enAttente, impayes,
    pageEA,  pageSizeEA,
    pageIMP, pageSizeIMP,
    visible, toggle, hide,
    allHidden,
    handlePageEA,  handlePageSizeEA,
    handlePageIMP, handlePageSizeIMP,
    handleConfirmerRH,
  };
};