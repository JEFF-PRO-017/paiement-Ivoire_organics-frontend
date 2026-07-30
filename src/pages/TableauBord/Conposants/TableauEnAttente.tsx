import React, { useMemo, useState } from 'react';
import { Card, CardBody, CardHeader, Col, Badge } from 'reactstrap';
import { createColumnHelper, RowSelectionState } from '@tanstack/react-table';
import { PaginatedResponse, EmployeAttendanceGroup, StatutPortefeuille } from '../../Utils/types';
import ModalDetailEmploye from '../Modal/ModalDetailEmploye';
import TableContainer from 'pages/Components/TableContainer'; // ← adaptez le chemin
import { useNavigate } from 'react-router';
import { NavItem } from 'pages/Utils/Utils.model';

const col = createColumnHelper<EmployeAttendanceGroup>();
const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';

// dérivés : la liste d'attendance remplace les champs directs de l'ancien Portefeuille
const nbJours = (g: EmployeAttendanceGroup) => g.attendance_list.length;
const montantTotal = (g: EmployeAttendanceGroup) =>
  g.attendance_list.reduce((acc, a) => acc + parseFloat(a.montant_journalier), 0);
const attendanceIds = (g: EmployeAttendanceGroup) => g.attendance_list.map(a => a.id);

interface Props {
  data: PaginatedResponse<EmployeAttendanceGroup>;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (size: number) => void;
  onConfirmerRH: (ids: number[]) => Promise<void>;
  onRefetch?: () => void; // rafraîchit ce tableau après création/archivage d'une présence depuis la modale
}

const TableauEnAttente: React.FC<Props> = ({
  data, page, pageSize, onPageChange, onPageSizeChange, onConfirmerRH, onRefetch,
}) => {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [modal, setModal] = useState<EmployeAttendanceGroup | null>(null);
  const [confirming, setConfirming] = useState(false);

  const rows = data?.data.results ?? [];
  const total = data?.data.pagination.count ?? 0;
  const navigate = useNavigate();

  const handleRowClick = (clicked: EmployeAttendanceGroup, all: EmployeAttendanceGroup[]) => {
    const queue: NavItem[] = all.map(g => ({ id: g.employe.id, nom: g.employe.nom_complet }));
    const index = all.findIndex(g => g.employe.id === clicked.employe.id);
    navigate(`/paiement/${clicked.employe.id}`, { state: { queue, index } });
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
    col.accessor(g => g.employe.nom_complet, {
      id: 'nom', header: 'Employé',
      cell: ({ row }) => (
        <button className="btn btn-link text-primary fw-medium p-0 text-start"
          onClick={() => setModal(row.original)}>
          {row.original.employe.nom_complet}
        </button>
      ),
    }),
    col.accessor(g => g.employe.departement, {
      id: 'dept', header: 'Département',
      cell: ({ getValue }) => <span className="text-muted">{getValue() ?? '—'}</span>,
    }),
    col.accessor(g => g.employe.site_travail, {
      id: 'site', header: 'Site',
      cell: ({ getValue }) => <span className="text-muted">{getValue() ?? '—'}</span>,
    }),
    col.display({
      id: 'jours', header: 'Jours',
      cell: ({ row }) => <Badge className="bg-white-subtle text-white">{nbJours(row.original)} j</Badge>,
    }),
    col.display({
      id: 'montant', header: 'Montant',
      cell: ({ row }) => <span className="fw-medium">{fmt(montantTotal(row.original))}</span>,
    }),
    col.display({
      id: 'statut', header: 'Statut',
      cell: ({ row }) => <span className="fw-medium"> {row.original.employe.statut}</span>,
    }),
    col.display({
      id: 'mobile_phone', header: 'Tel',
      cell: ({ row }) => <span className="fw-medium">{row.original.employe.mobile_phone ?? ` - `}</span>,
    }),
    col.display({
      id: 'operateur_mobile', header: 'Operateur',
      cell: ({ row }) => <span className="fw-medium">{row.original.employe.operateur_mobile ?? ` - `}</span>,
    }),
    col.display({
      id: 'confirmer', header: 'Confirmer',
      cell: ({ row }) => (
        <button className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
          onClick={() => onConfirmerRH(attendanceIds(row.original))}>
          <i className="ri-check-line" /> Confirmer
        </button>
      ),
    }),
    col.display({
      id: 'detail', header: 'Détail',
      cell: ({ row }) => (
        <button className="btn btn-outline-warning btn-sm d-flex align-items-center gap-1"
          onClick={() => setModal(rows?.find(r=>r.employe.id===row.original.employe.id) ?? null)}>
          <i className="ri-eye-line" /> Voir
        </button>
      ),
    }),
  ], [onConfirmerRH]);

  const selectedEmployeIds = Object.keys(rowSelection).map(Number);
  const selectedGroups = rows.filter(g => selectedEmployeIds.includes(g.employe.id));
  const selectedMontant = selectedGroups.reduce((acc, g) => acc + montantTotal(g), 0);
  const selectedAttendanceIds = selectedGroups.flatMap(attendanceIds);

  const handleGroupConfirm = async () => {
    if (!selectedAttendanceIds.length) return;
    setConfirming(true);
    await onConfirmerRH(selectedAttendanceIds);
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

            {selectedEmployeIds.length > 0 && (
              <div className="d-flex align-items-center gap-2 px-3 py-1 rounded-2 bg-primary-subtle border border-primary-subtle">
                <i className="ri-checkbox-multiple-line text-primary fs-16" />
                <span className="text-primary fw-semibold fs-13">
                  {selectedEmployeIds.length} sélectionné{selectedEmployeIds.length > 1 ? 's' : ''}
                </span>
                <span className="text-muted">·</span>
                <span className="text-muted fs-13">{fmt(selectedMontant)}</span>
                <button className="btn btn-success btn-sm d-flex align-items-center gap-1 ms-1"
                  onClick={handleGroupConfirm} disabled={confirming}>
                  {confirming
                    ? <><span className="spinner-border spinner-border-sm" /> En cours…</>
                    : <><i className="ri-check-double-line" /> Confirmer RH ({selectedEmployeIds.length})</>}
                </button>
              </div>
            )}
          </CardHeader>

          <CardBody>
            <TableContainer
              columns={columns}
              data={rows.map(row =>
                ({ employe: row.employe, attendance_list: row.attendance_list.filter(a => a.statut_paiement === StatutPortefeuille.EN_ATTENTE) })
              )}
              isGlobalFilter
              isExport
              exportFilename="portefeuilles_en_attente"
              SearchPlaceholder="Rechercher un employé, département…"
              rowSelection={rowSelection}
              onRowSelectionChange={setRowSelection}
              getRowId={g => String(g.employe.id)}
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
        group={modal}
        isOpen={!!modal}
        toggle={() => setModal(null)}
        onConfirmerRH={ids => onConfirmerRH(ids)}
        onViewPortefeuille={g => handleRowClick(g, rows)}
        onRefetch={onRefetch}
      />
    </React.Fragment>
  );
};

export default TableauEnAttente;