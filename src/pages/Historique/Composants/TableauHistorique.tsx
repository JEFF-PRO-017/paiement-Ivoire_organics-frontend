import React, { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button } from 'reactstrap';
import {
  createColumnHelper, flexRender,
  getCoreRowModel, getSortedRowModel,
  useReactTable, SortingState, OnChangeFn,
} from '@tanstack/react-table';

import { LignePaiement } from '../Hook/historique.types';
import { STATUT_CLR } from '../Hook/historique.constants';
import Pagination from 'pages/Components/Pagination';
import { fmtDate, fmt } from '../../Utils/Utils';
import { NavItem } from 'pages/Utils/Utils.model';

interface Props {
  data: LignePaiement[];
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

const col = createColumnHelper<LignePaiement>();


const TableauHistorique: React.FC<Props> = ({
  data, totalCount, page, pageSize, totalPages,
  sorting, onSortingChange, onPageChange, onPageSizeChange, onExportPDF,
}) => {

  const navigate = useNavigate();

  // rows = vos données déjà chargées (la liste affichée dans le tableau)
  // Adapter `r.portefeuille_id` et `r.employe.nom_complet` selon vos types réels.

   const handleRowClick = (clickedRow: any, rows: any[]) => {
    const queue: NavItem[] = rows.map(r => ({
      id: r.portefeuille__id,       // ← l'id du portefeuille
      nom: r.employe__nom_complet,   // ← le nom affiché dans la navbar
    }));

    const index = rows.findIndex(r => r.portefeuille__id === clickedRow.portefeuille__id);

    navigate(`/paiement/${clickedRow.portefeuille__id}`, {
      state: { queue, index },
    });
  };

  console.log('Rerender TableauHistorique', { data, totalCount, page, pageSize, totalPages, sorting });
  const columns = useMemo(() => [
    col.accessor('date_paiement', {
      header: 'Date',
      cell: ({ getValue }) => <span className="fw-medium">{fmtDate(getValue())}</span>,
    }),
    col.accessor('employe__nom_complet', {
      header: 'Employé',
      cell: ({ row }) => (
        <div>
          <div className="fw-medium">{row.original.employe__nom_complet}</div>
          <small className="text-muted">{row.original.employe__id}</small>
        </div>
      ),
    }),
    col.accessor('employe__departement', {
      header: 'Département',
      cell: ({ getValue }) => <span className="text-muted">{getValue()}</span>,
    }),
    col.accessor('nombre_jours', {
      header: 'Jours payés',
      cell: ({ getValue }) => (
        <Badge  className="bg-white-subtle text-white">{getValue()} j</Badge>
      ),
    }),
    col.accessor('montant_total', {
      header: 'Montant',
      cell: ({ getValue }) => <span className="fw-medium text-success">{fmt(getValue())}</span>,
    }),
    col.accessor('portefeuille__statut', {
      header: 'Statut',
      cell: ({ getValue }) => {
        const c = STATUT_CLR[getValue()];
        return <Badge color={c} className={`bg-${c}-subtle text-${c}`}>{getValue()}</Badge>;
      },
    }),
    col.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <button
            onClick={() => handleRowClick(row.original, data)}  // ← passer la ligne cliquée et les données actuelles
            className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1"
          >
            <i className="ri-eye-line" />Détail
          </button>
        </div>
      ),
    }),
  ], [onExportPDF]);

  const table = useReactTable({
    data: data ?? [],  // ← data au lieu de paginated
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
                <td colSpan={7} className="text-center py-5 text-muted">
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