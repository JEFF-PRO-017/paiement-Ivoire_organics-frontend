import React, { useMemo, useState } from 'react';
import { Card, CardBody, CardHeader, Col, Badge } from 'reactstrap';
import { createColumnHelper, RowSelectionState } from '@tanstack/react-table';
import { Paginated, Portefeuille } from '../../Utils/types';
import ModalDetailEmploye from '../Modal/ModalDetailEmploye';
import TableContainer from 'pages/Components/TableContainer'; // ← adaptez le chemin
import { useNavigate } from 'react-router';
import { NavItem } from 'pages/Utils/Utils.model';

const col = createColumnHelper<Portefeuille>();
const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';

interface Props {
  data: Paginated<Portefeuille>;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (size: number) => void;
  onConfirmerRH: (ids: number[]) => Promise<void>;
}

const TableauEnAttente: React.FC<Props> = ({
  data, page, pageSize, onPageChange, onPageSizeChange, onConfirmerRH,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [modal, setModal] = useState<Portefeuille | null>(null);
  const [confirming, setConfirming] = useState(false);

  const rows = data?.results ?? [];
  const total = data?.count ?? 0;

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
        <Badge   className="bg-white-subtle text-white">{getValue()} j</Badge>
      ),
    }),
    col.accessor(r => r.nombre_jours_impayes * r.montant_journalier, {
      id: 'montant', header: 'Montant',
      cell: ({ getValue }) => <span className="fw-medium">{fmt(getValue())}</span>,
    }),
    col.display({
      id: 'confirmer', header: 'Confirmer',
      cell: ({ row }) => (
        <button className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
          onClick={() => onConfirmerRH([row.original.id])}>
          <i className="ri-check-line" /> Confirmer
        </button>
      ),
    }),
    col.display({
      id: 'detail', header: 'Détail',
      cell: ({ row }) => (
        <button className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1"
          onClick={() => setModal(row.original)}>
          <i className="ri-eye-line" /> Voir
        </button>
      ),
    }),
  ], [onConfirmerRH]);

  const selectedIds = Object.keys(rowSelection).map(Number);
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
              <Badge>{total}</Badge>
            </div>

            {/* Barre de sélection groupée */}
            {selectedIds.length > 0 && (
              <div
                className="d-flex align-items-center gap-2 px-3 py-1 rounded-2 bg-primary-subtle border border-primary-subtle"
                style={{ animation: 'secFadeIn .22s ease' }}
              >
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
                    : <><i className="ri-check-double-line" /> Confirmer RH ({selectedIds.length})</>
                  }
                </button>
              </div>
            )}
          </CardHeader>

          <CardBody>
            <TableContainer
              columns={columns}
              data={rows}
              // filtre & export
              isGlobalFilter
              isExport
              exportFilename="portefeuilles_en_attente"
              SearchPlaceholder="Rechercher un employé, département…"
              // sélection
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              getRowId={row => String(row.id)}
              // pagination
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
        onConfirmerRH={id => onConfirmerRH([id])}
        onViewPortefeuille={p => {
          handleRowClick(p, rows);
        }}
      />
    </React.Fragment>
  );
};

export default TableauEnAttente;