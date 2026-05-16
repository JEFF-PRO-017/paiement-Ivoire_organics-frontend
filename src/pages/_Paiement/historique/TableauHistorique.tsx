/*
  TableauHistorique.tsx
  Table TanStack avec tri, cellules métier et pagination.
*/

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from 'reactstrap';
import {
    createColumnHelper, flexRender,
    getCoreRowModel, getSortedRowModel,
    useReactTable, SortingState,
    OnChangeFn,
} from '@tanstack/react-table';

import { LignePaiement } from './historique.types';
import { STATUT_CLR, fmt, fmtDate, PAGE_LIMIT } from './historique.constants';

interface Props {
    paginated: LignePaiement[];
    filtered: LignePaiement[];
    page: number;
    totalPages: number;
    sorting: SortingState;
    onSortingChange: OnChangeFn<SortingState>;
    onPageChange: (p: number) => void;
    onExportPDF: (id: number) => void;
}

const col = createColumnHelper<LignePaiement>();

const TableauHistorique: React.FC<Props> = ({
    paginated, filtered, page, totalPages,
    sorting, onSortingChange, onPageChange, onExportPDF,
}) => {

    const columns = useMemo(() => [
        col.accessor('date', {
            header: 'Date',
            cell: ({ getValue }) => <span className="fw-medium">{fmtDate(getValue())}</span>,
        }),
        col.accessor('employe_nom', {
            header: 'Employé',
            cell: ({ row }) => (
                <div>
                    <div className="fw-medium">{row.original.employe_nom}</div>
                    <small className="text-muted">{row.original.employe_id}</small>
                </div>
            ),
        }),
        col.accessor('departement', {
            header: 'Département',
            cell: ({ getValue }) => <span className="text-muted">{getValue()}</span>,
        }),
        col.accessor('jours', {
            header: 'Jours payés',
            cell: ({ getValue }) => (
                <Badge color="warning" className="bg-warning-subtle text-warning">{getValue()} j</Badge>
            ),
        }),
        col.accessor('montant', {
            header: 'Montant',
            cell: ({ getValue }) => <span className="fw-medium text-success">{fmt(getValue())}</span>,
        }),
        col.accessor('statut', {
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
                    <Link
                        to={`/paiements/portefeuille/${row.original.id}`}
                        className="btn btn-soft-primary btn-sm d-flex align-items-center gap-1"
                    >
                        <i className="ri-eye-line" />Détail
                    </Link>
                    {/* <button
                        className="btn btn-soft-success btn-sm d-flex align-items-center gap-1"
                        onClick={() => onExportPDF(row.original.id)}
                    >
                        <i className="ri-download-line" />PDF
                    </button> */}
                </div>
            ),
        }),
    ], [onExportPDF]);

    const table = useReactTable({
        data: paginated,
        columns,
        state: { sorting },
        onSortingChange,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getRowId: row => String(row.id),
        manualPagination: true,
    });

    const debut = Math.min((page - 1) * PAGE_LIMIT + 1, filtered.length);
    const fin = Math.min(page * PAGE_LIMIT, filtered.length);

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
                        {table.getRowModel().rows.length === 0 ? (
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

            {/* Pagination */}
            <div className="align-items-center mt-3 justify-content-between d-flex">
                <div className="text-muted fs-13">
                    Affichage{' '}
                    <span className="fw-semibold">{debut}–{fin}</span>
                    {' '}sur{' '}
                    <span className="fw-semibold">{filtered.length}</span>
                </div>
                <ul className="pagination pagination-separated pagination-sm mb-0">
                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                        <Link to="#" className="page-link" onClick={() => onPageChange(page - 1)}>←</Link>
                    </li>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                        <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                            <Link to="#" className="page-link" onClick={() => onPageChange(p)}>{p}</Link>
                        </li>
                    ))}
                    <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                        <Link to="#" className="page-link" onClick={() => onPageChange(page + 1)}>→</Link>
                    </li>
                </ul>
            </div>
        </>
    );
};

export default TableauHistorique;