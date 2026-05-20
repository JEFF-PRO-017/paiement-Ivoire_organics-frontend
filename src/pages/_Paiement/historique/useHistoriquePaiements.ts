import { useEffect, useMemo, useState } from 'react';
import { toast }                        from 'react-toastify';
import { SortingState, OnChangeFn }     from '@tanstack/react-table';

import { LignePaiement, StatsHistorique, FiltresState } from './historique.types';
import { chipToDateRange }                              from './historique.constants';
import { historiqueService }                            from './historiqueService';

export interface UseHistoriquePaiementsReturn {
  paginated:       LignePaiement[];
  filtered:        LignePaiement[];
  stats:           StatsHistorique;
  isLoading:       boolean;

  sorting:         SortingState;
  onSortingChange: OnChangeFn<SortingState>;

  filtres:         FiltresState;
  setSearch:       (v: string) => void;
  setDept:         (v: string) => void;
  setDateRange:    (v: Date[]) => void;
  handleChip:      (c: string) => void;
  handleReset:     () => void;

  page:            number;
  pageSize:        number;
  totalPages:      number;
  setPage:         (p: number) => void;
  setPageSize:     (s: number) => void;

  handleExportCSV:      () => Promise<void>;
  handleExportPDF:      () => Promise<void>;
  handleExportPDFLigne: (id: number) => Promise<void>;
}

export const useHistoriquePaiements = (): UseHistoriquePaiementsReturn => {

  const [allData,   setAllData]   = useState<LignePaiement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search,     setSearchRaw]    = useState('');
  const [dept,       setDeptRaw]      = useState('Tous');
  const [dateRange,  setDateRangeRaw] = useState<Date[]>([]);
  const [activeChip, setActiveChip]   = useState('');
  const [page,       setPageRaw]      = useState(1);
  const [pageSize,   setPageSizeRaw]  = useState(10);

  const [sorting, setSorting] = useState<SortingState>([]);

  // ── Chargement ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = await historiqueService.fetchAll();
        if (!cancelled) setAllData(data);
      } catch {
        if (!cancelled) toast.error("Impossible de charger l'historique");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // ── Setters avec reset de page ──────────────────────────────────────────────
  const setSearch    = (v: string) => { setSearchRaw(v);  setPageRaw(1); };
  const setDept      = (v: string) => { setDeptRaw(v);    setPageRaw(1); };
  const setDateRange = (v: Date[]) => { setDateRangeRaw(v); setActiveChip('Personnalisé'); setPageRaw(1); };
  const handleChip   = (chip: string) => {
    const [from, now] = chipToDateRange(chip);
    setDateRangeRaw([from, now]); setActiveChip(chip); setPageRaw(1);
  };
  const handleReset  = () => {
    setSearchRaw(''); setDeptRaw('Tous'); setDateRangeRaw([]); setActiveChip(''); setPageRaw(1);
  };
  const setPageSize  = (s: number) => { setPageSizeRaw(s); setPageRaw(1); };

  // ── Filtrage ────────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let d = allData;
    if (search) {
      const q = search.toLowerCase();
      d = d.filter(l => l.employe_nom.toLowerCase().includes(q) || l.employe_id.toLowerCase().includes(q));
    }
    if (dept !== 'Tous') d = d.filter(l => l.departement === dept);
    if (dateRange.length === 2) {
      const [from, to] = dateRange;
      d = d.filter(l => { const dd = new Date(l.date); return dd >= from && dd <= to; });
    }
    return d;
  }, [allData, search, dept, dateRange]);

  // ── Stats ───────────────────────────────────────────────────────────────────
  const stats = useMemo((): StatsHistorique => {
    const total = filtered.reduce((a, l) => a + l.montant, 0);
    return {
      total,
      count:    filtered.length,
      moyenne:  filtered.length ? Math.round(total / filtered.length) : 0,
      employes: new Set(filtered.map(l => l.employe_id)).size,
    };
  }, [filtered]);

  // ── Pagination ──────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = useMemo(
    () => filtered.slice((safePage - 1) * pageSize, safePage * pageSize),
    [filtered, safePage, pageSize],
  );

  // ── Exports ─────────────────────────────────────────────────────────────────
  const handleExportCSV = async () => {
    try { await historiqueService.exporterCSV(filtered); toast.success('Export CSV téléchargé'); }
    catch { toast.error("Erreur lors de l'export CSV"); }
  };
  const handleExportPDF = async () => {
    try { await historiqueService.exporterPDF({ search, dept, dateRange, activeChip, page: safePage }); toast.success('Export PDF téléchargé'); }
    catch (e: any) { toast.info(e?.message ?? 'Export PDF non disponible'); }
  };
  const handleExportPDFLigne = async (id: number) => {
    try { await historiqueService.exporterPDFLigne(id); }
    catch (e: any) { toast.info(e?.message ?? 'Export PDF non disponible'); }
  };

  return {
    paginated, filtered, stats, isLoading,
    sorting, onSortingChange: setSorting as OnChangeFn<SortingState>,
    filtres: { search, dept, dateRange, activeChip, page: safePage },
    setSearch, setDept, setDateRange, handleChip, handleReset,
    page: safePage, pageSize, totalPages,
    setPage: setPageRaw, setPageSize,
    handleExportCSV, handleExportPDF, handleExportPDFLigne,
  };
};