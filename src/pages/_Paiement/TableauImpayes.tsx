import React, { useMemo, useState } from 'react';
import { Card, CardBody, CardHeader, Col, Badge } from 'reactstrap';
import { createColumnHelper } from '@tanstack/react-table';
import { Link, useNavigate } from 'react-router-dom';
import { Paginated, Portefeuille } from './types';
import ModalDetailEmploye from './ModalDetailEmploye';
import TableContainer from 'pages/Components/TableContainer'; // ← adaptez le chemin
import { NavItem } from 'pages/Utils/Utils.model';

const col = createColumnHelper<Portefeuille>();
const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';

interface Props {
  data?: Paginated<Portefeuille>;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (size: number) => void;
}

const TableauImpayes: React.FC<Props> = ({
  data, page, pageSize, onPageChange, onPageSizeChange,
}) => {
  const navigate = useNavigate();

  // rows = vos données déjà chargées (la liste affichée dans le tableau)
  // Adapter `r.portefeuille_id` et `r.employe.nom_complet` selon vos types réels.

  const handleRowClick = (clickedRow: any, rows: any[]) => {
    const queue: NavItem[] = rows.map(r => ({
      id: r.id,       // ← l'id du portefeuille
      nom: r.employe.nom_complet,   // ← le nom affiché dans la navbar
    }));

    const index = rows.findIndex(r => r.id === clickedRow.id);

    navigate(`/paiement/${clickedRow.id}`, {
      state: { queue, index },
    });
  };

  const [modal, setModal] = useState<Portefeuille | null>(null);

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;

  const columns = useMemo(() => [
    col.accessor(r => r.employe?.nom_complet, {
      id: 'nom', header: 'Employé',
      cell: ({ row }) => (
        <button
          className="btn btn-link text-danger fw-medium p-0 text-start"
          onClick={() => setModal(row.original)}
        >
          {row.original.employe?.nom_complet ?? '—'}
        </button>
      ),
    }),
    col.accessor(r => r.employe?.departement, {
      id: 'dept', header: 'Département',
      cell: ({ getValue }) => <span className="text-muted">{getValue() ?? '—'}</span>,
    }),
    col.accessor(r => r.employe?.site_travail, {
      id: 'site', header: 'Site',
      cell: ({ getValue }) => <span className="text-muted">{getValue() ?? '—'}</span>,
    }),
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
      cell: ({ row }) => (
        <button
          className="btn btn-soft-danger btn-sm d-flex align-items-center gap-1"
          onClick={() => handleRowClick(row.original, rows)}>
          <i className="ri-bank-card-line" /> Payer
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
          <i className="ri-eye-line" /> Voir
        </button>
      ),
    }),
  ], []);

  return (
    <React.Fragment>
      <Col xl={12}>
        <Card className="card-height-100">

          <CardHeader className="d-flex align-items-center border-bottom">
            <div className="d-flex align-items-center gap-2 flex-grow-1">
              <div className="rounded-1" style={{ width: 4, height: 20, background: 'var(--vz-danger)' }} />
              <h4 className="card-title mb-0">Portefeuilles impayés</h4>
              <Badge color="danger" className="bg-danger-subtle text-danger">{total}</Badge>
            </div>
            <small className="text-muted d-flex align-items-center gap-1">
              <i className="ri-arrow-down-circle-line" />
              Alimenté après confirmation RH
            </small>
          </CardHeader>

          <CardBody>
            <TableContainer
              columns={columns}
              data={rows}
              // filtre & export
              isGlobalFilter
              isExport
              exportFilename="portefeuilles_impayes"
              SearchPlaceholder="Rechercher un employé, département…"
              // pagination serveur
              page={page}
              total={total}
              pageSize={pageSize}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
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