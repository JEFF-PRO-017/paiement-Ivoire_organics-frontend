import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, Badge } from 'reactstrap';
import {
  useReactTable, getCoreRowModel, flexRender, createColumnHelper,
} from '@tanstack/react-table';
import { Paginated, Portefeuille } from './types';
import ModalDetailEmploye from './ModalDetailEmploye';

interface Props {
  data: Paginated<Portefeuille>;
  page: number;
  onPageChange: (p: number) => void;
}

const col = createColumnHelper<Portefeuille>();

const TableauImpayes: React.FC<Props> = ({ data, page, onPageChange }) => {
  const [modal, setModal] = useState<Portefeuille | null>(null);
  const fmt        = (n: number) => n.toLocaleString('fr-FR') + ' F';
  const totalPages = Math.ceil(data.total / data.limit);

  const columns = useMemo(() => [
    col.accessor(r => r.employe?.nom_complet, {
      id: 'nom', header: 'Employé',
      cell: ({ row }) => (
        <button
          className="btn btn-link text-danger fw-medium p-0 text-start"
          onClick={() => setModal(row.original)}
        >
          {row.original.employe?.nom_complet}
        </button>
      ),
    }),
    col.accessor(r => r.employe?.departement, { id: 'dept', header: 'Département',
      cell: ({ getValue }) => <span className="text-muted">{getValue()}</span> }),
    col.accessor(r => r.employe?.site_travail, { id: 'site', header: 'Site',
      cell: ({ getValue }) => <span className="text-muted">{getValue()}</span> }),
    col.accessor('nombre_jours_impayes', {
      header: 'Jours',
      cell: ({ getValue }) => (
        <Badge color="danger" className="bg-danger-subtle text-danger">{getValue()} j</Badge>
      ),
    }),
    col.accessor(r => r.nombre_jours_impayes * r.montant_journalier, {
      id: 'montant', header: 'Montant',
      cell: ({ getValue }) => <span className="fw-medium">{fmt(getValue())}</span>,
    }),
    col.display({
      id: 'payer', header: 'Payer',
      cell: () => (
        <button className="btn btn-soft-danger btn-sm d-flex align-items-center gap-1">
          <i className="ri-bank-card-line" />Payer
        </button>
      ),
    }),
    col.display({
      id: 'detail', header: 'Détail',
      cell: ({ row }) => (
        <button
          className="btn btn-soft-danger btn-sm d-flex align-items-center gap-1"
          onClick={() => setModal(row.original)}
        >
          <i className="ri-eye-line" />Voir
        </button>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: data.data, columns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: row => String(row.id),
  });

  return (
    <React.Fragment>
      <Col xl={12}>
        <Card className="card-height-100">
          <CardHeader className="d-flex align-items-center border-bottom">
            <div className="d-flex align-items-center gap-2 flex-grow-1">
              <div className="rounded-1" style={{ width: 4, height: 20, background: 'var(--vz-danger)' }} />
              <h4 className="card-title mb-0">Portefeuilles impayés</h4>
              <Badge color="danger" className="bg-danger-subtle text-danger">{data.total}</Badge>
            </div>
            <small className="text-muted d-flex align-items-center gap-1">
              <i className="ri-arrow-down-circle-line" />
              Alimenté après confirmation RH
            </small>
          </CardHeader>

          <CardBody>
            <div className="table-responsive table-card">
              <table className="table table-hover table-nowrap table-centered align-middle mb-0">
                <thead className="bg-light text-muted">
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="align-items-center mt-3 justify-content-between d-flex">
              <div className="text-muted fs-13">
                Affichage <span className="fw-semibold">{(page - 1) * data.limit + 1}–{Math.min(page * data.limit, data.total)}</span> sur <span className="fw-semibold">{data.total}</span>
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
          </CardBody>
        </Card>
      </Col>

      <ModalDetailEmploye
        portefeuille={modal}
        isOpen={!!modal}
        toggle={() => setModal(null)}
      />
    </React.Fragment>
  );
};

export default TableauImpayes;