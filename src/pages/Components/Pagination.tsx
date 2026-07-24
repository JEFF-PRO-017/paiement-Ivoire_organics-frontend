import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PaginationProps {
  /** Page courante (1-indexed) */
  page: number;
  /** Nombre total d'éléments */
  total: number;
  /** Nombre d'éléments par page */
  pageSize: number;
  /** Options disponibles pour le nombre d'éléments par page */
  pageSizeOptions?: number[];
  /** Callback déclenché lors du changement de page */
  onPageChange: (page: number) => void;
  /** Callback déclenché lors du changement de taille de page */
  onPageSizeChange?: (pageSize: number) => void;
  /**
   * Nombre max de boutons de page visibles de chaque côté de la page active
   * avant d'afficher les "…"
   * @default 1
   */
  siblingCount?: number;
}

// ─── Hook : calcul des plages de pages ────────────────────────────────────────

type PageItem = number | '...';

function usePagination(
  page: number,
  totalPages: number,
  siblingCount: number,
): PageItem[] {
  return useMemo(() => {
    // Toujours afficher si peu de pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const left = Math.max(2, page - siblingCount);
    const right = Math.min(totalPages - 1, page + siblingCount);

    const showLeftDots = left > 2;
    const showRightDots = right < totalPages - 1;

    const items: PageItem[] = [1];

    if (showLeftDots) items.push('...');
    for (let i = left; i <= right; i++) items.push(i);
    if (showRightDots) items.push('...');
    items.push(totalPages);

    return items;
  }, [page, totalPages, siblingCount]);
}

// ─── Composant ────────────────────────────────────────────────────────────────

const DEFAULT_PAGE_SIZE_OPTIONS = [5,10, 25, 50, 100];

const Pagination: React.FC<PaginationProps> = ({
  page,
  total,
  pageSize,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  onPageChange,
  onPageSizeChange,
  siblingCount = 1,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const debut = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const fin = Math.min(page * pageSize, total);
  const isEmpty = total === 0;

  const pageItems = usePagination(page, totalPages, siblingCount);

  if (isEmpty) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    if (page < totalPages) onPageChange(page + 1);
  };

  const handlePageClick = (p: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (p !== page) onPageChange(p);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    // Recalcule la page pour rester proche de la position actuelle
    const newPage = Math.max(1, Math.ceil(debut / newSize));
    onPageSizeChange?.(newSize);
    onPageChange(newPage);
  };

  return (
    <div className="align-items-center mt-4 justify-content-between d-flex flex-wrap gap-2">
      {/* Info + sélecteur de taille */}
      <div className="d-flex align-items-center gap-2">
        <div className="text-muted fs-13">
          Affichage{' '}
          <span className="fw-semibold">{debut}–{fin}</span> sur{' '}
          <span className="fw-semibold">{total}</span>
        </div>

        {onPageSizeChange && (
          <div className="d-flex align-items-center gap-1 ms-2">
            <label htmlFor="pagination-page-size" className="text-muted fs-13 mb-0">
              Lignes :
            </label>
            <select
              id="pagination-page-size"
              className="form-select form-select-sm"
              style={{ width: 'auto', minWidth: 68 }}
              value={pageSize}
              onChange={handleSizeChange}
            >
              {pageSizeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Boutons de page */}
      <ul className="pagination pagination-separated pagination-sm mb-0">
        {/* ← Précédent */}
        <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
          <Link
            to="#"
            className="page-link"
            aria-label="Page précédente"
            onClick={handlePrev}
          >
            ←
          </Link>
        </li>

        {/* Pages + "…" */}
        {pageItems.map((item, idx) =>
          item === '...' ? (
            <li key={`dots-${idx}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li
              key={item}
              className={`page-item ${item === page ? 'active' : ''}`}
            >
              <Link
                to="#"
                className="page-link"
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
                onClick={handlePageClick(item)}
              >
                {item}
              </Link>
            </li>
          ),
        )}

        {/* → Suivant */}
        <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
          <Link
            to="#"
            className="page-link"
            aria-label="Page suivante"
            onClick={handleNext}
          >
            →
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Pagination;