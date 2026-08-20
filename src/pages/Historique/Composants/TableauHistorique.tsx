import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge } from 'reactstrap';
import {
  createColumnHelper, flexRender,
  getCoreRowModel, getSortedRowModel,
  useReactTable, SortingState, OnChangeFn,
} from '@tanstack/react-table';

import { Paiement } from '../Hook/historique.types';
import { STATUT_CLR } from '../Hook/historique.constants';
import Pagination from 'pages/Components/Pagination';
import { fmtDate, fmt } from '../../Utils/Utils';
import { NavItem } from 'pages/Utils/Utils.model';

interface Props {
  data: Paiement[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  sorting: SortingState;
  onSortingChange: OnChangeFn<SortingState>;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
  onExportPDF: (id: number) => void;
}

const col = createColumnHelper<Paiement>();

// fallback si un statut renvoyé par le back n'est pas encore dans STATUT_CLR
const statutColor = (statut: string) => STATUT_CLR[statut as keyof typeof STATUT_CLR] ?? 'secondary';

const TableauHistorique: React.FC<Props> = ({
  data, totalCount, page, pageSize, totalPages,
  sorting, onSortingChange, onPageChange, onPageSizeChange, onExportPDF,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (clickedRow: Paiement, rows: Paiement[]) => {
    const queue: NavItem[] = rows.map(r => ({
      id: r.id,
      nom: r.employe.nom_complet,
    }));

    const index = rows.findIndex(r => r.id === clickedRow.id);

    navigate(`/paiement/${clickedRow.id}`, {
      state: { queue, index },
    });
  };

  const columns = useMemo(() => [
    col.accessor('date_paiement', {
      header: 'Date',
      cell: ({ getValue }) => <span className="fw-medium">{fmtDate(getValue())}</span>,
    }),
    col.accessor(row => row.employe.nom_complet, {
      id: 'employe_nom',
      header: 'Employé',
      cell: ({ row }) => (
        <div>
          <div className="fw-medium">{row.original.employe.nom_complet}</div>
          <small className="text-muted">{row.original.employe.clientReferenceId}</small>
        </div>
      ),
    }),
    col.accessor(row => row.employe.departement, {
      id: 'departement',
      header: 'Département',
      cell: ({ getValue }) => <span className="text-muted">{getValue()}</span>,
    }),
    col.accessor(row => row.attendances?.length ?? 0, {
      id: 'jours_payes',
      header: 'Jours payés',
      cell: ({ getValue }) => (
        <Badge className="bg-white-subtle text-white">{getValue()} j</Badge>
      ),
    }),
    col.accessor('montant', {
      header: 'Montant',
      cell: ({ getValue }) => <span className="fw-medium text-success">{fmt(Number(getValue()))}</span>,
    }),
    col.accessor('methode_paiement', {
      header: 'Méthode',
      cell: ({ getValue }) => <span className="text-muted">{getValue()}</span>,
    }),
    col.accessor('statut', {
      header: 'Statut',
      cell: ({ getValue }) => {
        const c = statutColor(getValue());
        return <Badge color={c} className={`bg-${c}-subtle text-${c}`}>{getValue()}</Badge>;
      },
    }),
    col.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <button
            onClick={() => handleRowClick(row.original, data)}
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          >
            <i className="ri-eye-line" />Détail
          </button>
        </div>
      ),
    }),
  ], [data]);

  const table = useReactTable({
    data: data ?? [],
    columns,
    state: { sorting },
    onSortingChange,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: row => String(row.id),
    manualPagination: true,
  });

  return (
    <>
      <div className="table-responsive table-card">
        <table className="table table-hover table-nowrap table-centered align-middle mb-0">
          <thead className="bg-light text-muted">
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id}>
                {hg.headers.map(h => (
                  <th
                    key={h.id}
                    onClick={h.column.getToggleSortingHandler()}
                    style={{ cursor: h.column.getCanSort() ? 'pointer' : 'default', userSelect: 'none' }}
                  >
                    {flexRender(h.column.columnDef.header, h.getContext())}
                    {h.column.getIsSorted() === 'asc' && <i className="ri-arrow-up-s-line ms-1" />}
                    {h.column.getIsSorted() === 'desc' && <i className="ri-arrow-down-s-line ms-1" />}
                    {!h.column.getIsSorted() && h.column.getCanSort() && (
                      <i className="ri-expand-up-down-line ms-1 text-muted" style={{ opacity: 0.35 }} />
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows?.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-5 text-muted">
                  <i className="ri-file-search-line display-6 d-block mb-2" />
                  Aucun résultat pour ces filtres
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <tr key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        total={totalCount}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
};

export default TableauHistorique;