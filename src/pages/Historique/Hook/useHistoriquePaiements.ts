import { useEffect, useState, useCallback } from 'react';
import { toast } from 'react-toastify';
import { SortingState, OnChangeFn } from '@tanstack/react-table';

import { chipToDateRange } from './historique.constants';
import { historiqueService } from '../Services/Service';
import { StatsHistorique, FiltresState, Paiement } from './historique.types';
import { PaginatedResponse } from 'pages/Utils/types';

export interface UseHistoriquePaiementsReturn {
  rows: Paiement[];
  stats: StatsHistorique;
  isLoading: boolean;

  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;

  filtres: FiltresState;
  setSearch: (v: string) => void;
  setDept: (v: string) => void;
  setDateRange: (v: Date[]) => void;
  handleChip: (c: string) => void;
  handleReset: () => void;

  page: number;
  pageSize: number;
  totalPages: number;
  totalCount: number;
  setPage: (p: number) => void;
  setPageSize: (s: number) => void;

  handleExportCSV: () => Promise<void>;
  handleExportPDF: () => Promise<void>;
  handleExportPDFLigne: (id: number) => Promise<void>;
}

const EMPTY_STATS: StatsHistorique = { total: 0, count: 0, moyenne: 0, employes: 0 };

export const useHistoriquePaiements = (): UseHistoriquePaiementsReturn => {

  // ── State UI ───────────────────────────────────────────────────────────────
  const [rows, setRows] = useState<Paiement[]>([]);
  const [stats, setStats] = useState<StatsHistorique>(EMPTY_STATS);
  const [isLoading, setIsLoading] = useState(true);
  const [sorting, setSorting] = useState<SortingState>([]);

  // ── Filtres ────────────────────────────────────────────────────────────────
  const [search, setSearchRaw] = useState('');
  const [dept, setDeptRaw] = useState('Tous');
  const [dateRange, setDateRangeRaw] = useState<Date[]>([]);
  const [activeChip, setActiveChip] = useState('');

  // ── Pagination ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [pageSize, setPageSizeRaw] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // ── Fetch (se déclenche à chaque changement de filtre ou de page) ──────────
  const fetchData = useCallback(async (
    filtres: Partial<FiltresState>,
    p: number,
    ps: number,
    cancelled: { current: boolean },
  ) => {
    setIsLoading(true);
    try {
      const res: PaginatedResponse<Paiement> = await historiqueService.fetchPage(filtres, p, ps);
      const data = res.data
      if (cancelled.current) return;
      setRows(data.results);
      data.stats && setStats(data.stats);
      setTotalPages(data.pagination.total_pages);
      setTotalCount(data.pagination.count);
    } catch {
      if (!cancelled.current) toast.error("Impossible de charger l'historique");
    } finally {
      if (!cancelled.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const cancelled = { current: false };
    fetchData({ search, dept, dateRange, activeChip, page }, page, pageSize, cancelled);
    return () => { cancelled.current = true; };
  }, [search, dept, dateRange, page, pageSize]); // ← chaque changement relance le fetch

  // ── Setters (reset page à 1 sur changement de filtre) ─────────────────────
  const setSearch = (v: string) => { setSearchRaw(v); setPage(1); };
  const setDept = (v: string) => { setDeptRaw(v); setPage(1); };
  const setDateRange = (v: Date[]) => { setDateRangeRaw(v); setActiveChip('Personnalisé'); setPage(1); };
  const setPageSize = (s: number) => { setPageSizeRaw(s); setPage(1); };

  const handleChip = (chip: string) => {
    const [from, now] = chipToDateRange(chip);
    setDateRangeRaw([from, now]);
    setActiveChip(chip);
    setPage(1);
  };

  const handleReset = () => {
    setSearchRaw(''); setDeptRaw('Tous'); setDateRangeRaw([]);
    setActiveChip(''); setPage(1);
  };

  // ── Exports ────────────────────────────────────────────────────────────────
  const handleExportCSV = async () => {
    try {
      await historiqueService.exporterCSV(rows);
      toast.success('Export CSV téléchargé');
    } catch {
      toast.error("Erreur lors de l'export CSV");
    }
  };

  const handleExportPDF = async () => {
    try {
      await historiqueService.exporterPDF({ search, dept, dateRange, activeChip}, page,pageSize);
      toast.success('Export PDF téléchargé');
    } catch (e: any) {
      toast.info(e?.message ?? 'Export PDF non disponible');
    }
  };

  const handleExportPDFLigne = async (id: number) => {
    try {
      await historiqueService.exporterPDFLigne(id);
    } catch (e: any) {
      toast.info(e?.message ?? 'Export PDF non disponible');
    }
  };

  return {
    rows, stats, isLoading,
    sorting, onSortingChange: setSorting as OnChangeFn<SortingState>,
    filtres: { search, dept, dateRange, activeChip, page },
    setSearch, setDept, setDateRange, handleChip, handleReset,
    page, pageSize, totalPages, totalCount,
    setPage, setPageSize,
    handleExportCSV, handleExportPDF, handleExportPDFLigne,
  };
};