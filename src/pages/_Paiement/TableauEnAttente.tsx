import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, Badge } from 'reactstrap';
import {
  useReactTable, getCoreRowModel, flexRender,
  createColumnHelper, RowSelectionState,
} from '@tanstack/react-table';
import { Paginated, Portefeuille } from './types';
import ModalDetailEmploye from './ModalDetailEmploye';

interface Props {
  data:          Paginated<Portefeuille>;
  page:          number;
  onPageChange:  (p: number) => void;
  onConfirmerRH: (ids: number[]) => Promise<void>;
}

const col = createColumnHelper<Portefeuille>();
const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';

const TableauEnAttente: React.FC<Props> = ({ data, page, onPageChange, onConfirmerRH }) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [modal,        setModal]        = useState<Portefeuille | null>(null);
  const [confirming,   setConfirming]   = useState(false);

  // ── Guards ────────────────────────────────────────────────────────────────
  const rows       = data?.results   ?? [];
  const total      = data?.count  ?? 0;
  const limit      = data?.limit  ?? 5;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const isEmpty    = rows.length === 0;

  // ── Pagination display ────────────────────────────────────────────────────
  const debut = total === 0 ? 0 : (page - 1) * limit + 1;
  const fin   = Math.min(page * limit, total);

  // ── Colonnes ──────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    col.display({
      id: 'select',
      header: ({ table }) => (
        <input type="checkbox" className="form-check-input"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input type="checkbox" className="form-check-input"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      size: 40,
    }),
    col.accessor(r => r.employe?.nom_complet, {
      id: 'nom', header: 'Employé',
      cell: ({ row }) => (
        <button className="btn btn-link text-primary fw-medium p-0 text-start"
          onClick={() => setModal(row.original)}>
          {row.original.employe?.nom_complet ?? '—'}
        </button>
      ),
    }),
    col.accessor(r => r.employe?.departement, { id: 'dept', header: 'Département',
      cell: ({ getValue }) => <span className="text-muted">{getValue() ?? '—'}</span> }),
    col.accessor(r => r.employe?.site_travail, { id: 'site', header: 'Site',
      cell: ({ getValue }) => <span className="text-muted">{getValue() ?? '—'}</span> }),
    col.accessor('nombre_jours_impayes', {
      header: 'Jours',
      cell: ({ getValue }) => (
        <Badge color="warning" className="bg-warning-subtle text-warning">{getValue()} j</Badge>
      ),
    }),
    col.accessor(r => r.nombre_jours_impayes * r.montant_journalier, {
      id: 'montant', header: 'Montant',
      cell: ({ getValue }) => <span className="fw-medium">{fmt(getValue())}</span>,
    }),
    col.display({
      id: 'confirmer', header: 'Confirmer',
      cell: ({ row }) => (
        <button className="btn btn-soft-success btn-sm d-flex align-items-center gap-1"
          onClick={() => onConfirmerRH([row.original.id])}>
          <i className="ri-check-line" />Confirmer
        </button>
      ),
    }),
    col.display({
      id: 'detail', header: 'Détail',
      cell: ({ row }) => (
        <button className="btn btn-soft-warning btn-sm d-flex align-items-center gap-1"
          onClick={() => setModal(row.original)}>
          <i className="ri-eye-line" />Voir
        </button>
      ),
    }),
  ], [onConfirmerRH]);

  const table = useReactTable({
    data: rows,
    columns,
    state: { rowSelection },
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => String(row.id),
  });

  const selectedIds     = Object.keys(rowSelection).map(Number);
  const selectedMontant = rows
    .filter(p => selectedIds.includes(p.id))
    .reduce((acc, p) => acc + p.nombre_jours_impayes * p.montant_journalier, 0);

  const handleGroupConfirm = async () => {
    if (!selectedIds.length) return;
    setConfirming(true);
    await onConfirmerRH(selectedIds);
    setRowSelection({});
    setConfirming(false);
  };

  return (
    <React.Fragment>
      <Col xl={12}>
        <Card className="card-height-100">
          <CardHeader className="d-flex align-items-center flex-wrap gap-2 border-bottom">
            <div className="d-flex align-items-center gap-2 flex-grow-1">
              <div className="rounded-1" style={{ width: 4, height: 20, background: 'var(--vz-warning)' }} />
              <h4 className="card-title mb-0">Portefeuilles en attente</h4>
              <Badge color="warning" className="bg-warning-subtle text-warning">{total}</Badge>
            </div>

            {selectedIds.length > 0 && (
              <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-2 bg-primary-subtle border border-primary-subtle"
                style={{ animation: 'secFadeIn .22s ease' }}>
                <i className="ri-checkbox-multiple-line text-primary fs-16" />
                <span className="text-primary fw-semibold fs-13">
                  {selectedIds.length} sélectionné{selectedIds.length > 1 ? 's' : ''}
                </span>
                <span className="text-muted">·</span>
                <span className="text-muted fs-13">{fmt(selectedMontant)}</span>
                <button
                  className="btn btn-success btn-sm d-flex align-items-center gap-1 ms-1"
                  onClick={handleGroupConfirm}
                  disabled={confirming}
                >
                  {confirming
                    ? <><span className="spinner-border spinner-border-sm" /> En cours…</>
                    : <><i className="ri-check-double-line" />Confirmer RH ({selectedIds.length})</>
                  }
                </button>
              </div>
            )}
          </CardHeader>

          <CardBody>
            <div className="table-responsive table-card">
              <table className="table table-hover table-nowrap table-centered align-middle mb-0">
                <thead className="bg-light text-muted">
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id} style={h.getSize() !== 150 ? { width: h.getSize() } : {}}>
                          {flexRender(h.column.columnDef.header, h.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {isEmpty ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-5 text-muted">
                        <i className="ri-inbox-line display-6 d-block mb-2" />
                        Aucun portefeuille en attente
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr key={row.id} className={row.getIsSelected() ? 'table-active' : ''}>
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id}>
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination — masquée si tableau vide */}
            {!isEmpty && (
              <div className="align-items-center mt-3 justify-content-between d-flex">
                <div className="text-muted fs-13">
                  Affichage <span className="fw-semibold">{debut}–{fin}</span> sur{' '}
                  <span className="fw-semibold">{total}</span>
                </div>
                <ul className="pagination pagination-separated pagination-sm mb-0">
                  <li className={`page-item ${page <= 1 ? 'disabled' : ''}`}>
                    <Link to="#" className="page-link" onClick={() => onPageChange(page - 1)}>←</Link>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                      <Link to="#" className="page-link" onClick={() => onPageChange(p)}>{p}</Link>
                    </li>
                  ))}
                  <li className={`page-item ${page >= totalPages ? 'disabled' : ''}`}>
                    <Link to="#" className="page-link" onClick={() => onPageChange(page + 1)}>→</Link>
                  </li>
                </ul>
              </div>
            )}
          </CardBody>
        </Card>
      </Col>

      <ModalDetailEmploye
        portefeuille={modal}
        isOpen={!!modal}
        toggle={() => setModal(null)}
        onConfirmerRH={id => onConfirmerRH([id])}
      />
    </React.Fragment>
  );
};

export default TableauEnAttente;