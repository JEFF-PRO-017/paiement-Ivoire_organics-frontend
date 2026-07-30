import React, { useMemo, useState } from 'react';
import { Card, CardBody, CardHeader, Col, Badge } from 'reactstrap';
import { createColumnHelper } from '@tanstack/react-table';
import { useNavigate } from 'react-router-dom';
import { PaginatedResponse, EmployeAttendanceGroup, StatutPortefeuille } from '../../Utils/types';
import ModalDetailEmploye from '../Modal/ModalDetailEmploye';
import TableContainer from 'pages/Components/TableContainer'; // ← adaptez le chemin
import { NavItem } from 'pages/Utils/Utils.model';

const col = createColumnHelper<EmployeAttendanceGroup>();
const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';

const nbJours = (g: EmployeAttendanceGroup) => g.attendance_list.length;
const montantTotal = (g: EmployeAttendanceGroup) =>
  g.attendance_list.reduce((acc, a) => acc + parseFloat(a.montant_journalier), 0);

interface Props {
  data?: PaginatedResponse<EmployeAttendanceGroup>;
  page: number;
  pageSize: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (size: number) => void;
  onRefetch?: () => void; // rafraîchit ce tableau après création/archivage d'une présence depuis la modale
}

const TableauImpayes: React.FC<Props> = ({
  data, page, pageSize, onPageChange, onPageSizeChange, onRefetch,
}) => {
  const navigate = useNavigate();
  const [modal, setModal] = useState<EmployeAttendanceGroup | null>(null);

  const rows = data?.data.results ?? [];
  const total = data?.data.pagination.count ?? 0;

  const handleRowClick = (clicked: EmployeAttendanceGroup, all: EmployeAttendanceGroup[]) => {
    const queue: NavItem[] = all.map(g => ({ id: g.employe.id, nom: g.employe.nom_complet }));
    const index = all.findIndex(g => g.employe.id === clicked.employe.id);
    navigate(`/paiement/${clicked.employe.id}`, { state: { queue, index } });
  };

  const columns = useMemo(() => [
    col.accessor(g => g.employe.nom_complet, {
      id: 'nom', header: 'Employé',
      cell: ({ row }) => (
        <button className="btn btn-link text-danger fw-medium p-0 text-start" onClick={() => setModal(row.original)}>
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
      id: 'payer', header: 'Payer',
      cell: ({ row }) => (
        <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
          onClick={() => handleRowClick(row.original, rows)}>
          <i className="ri-bank-card-line" /> Payer
        </button>
      ),
    }),
    col.display({
      id: 'detail', header: 'Détail',
      cell: ({ row }) => (
        <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" 
          onClick={() => setModal(rows?.find(r=>r.employe.id===row.original.employe.id) ?? null)}>
          <i className="ri-eye-line" /> Voir
        </button>
      ),
    }),
  ], [rows]);

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
              <i className="ri-arrow-down-circle-line" /> Alimenté après confirmation RH
            </small>
          </CardHeader>

          <CardBody>
            <TableContainer
              columns={columns}
              data={rows.map(row =>
                ({ employe: row.employe, attendance_list: row.attendance_list.filter(a => a.statut_paiement === StatutPortefeuille.IMPAYE) })
              )}
              isGlobalFilter
              isExport
              exportFilename="portefeuilles_impayes"
              SearchPlaceholder="Rechercher un employé, département…"
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
        onRefetch={onRefetch}
      />
    </React.Fragment>
  );
};

export default TableauImpayes;