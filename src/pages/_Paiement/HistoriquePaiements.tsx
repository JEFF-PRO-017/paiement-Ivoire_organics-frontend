import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, CardHeader, Col, Container, Row, Badge } from 'reactstrap';
import CountUp from 'react-countup';
import FeatherIcon from 'feather-icons-react';
import Flatpickr from 'react-flatpickr';
import {
  createColumnHelper, flexRender,
  getCoreRowModel, getSortedRowModel,
  useReactTable, SortingState,
} from '@tanstack/react-table';
import BreadCrumb from '../../Components/Common/BreadCrumb';
import { StatutPortefeuille } from './types';

// ── Types & fake data ──────────────────────────────────────────────────────────
interface LignePaiement {
  id: number;
  date: string;
  employe_nom: string;
  employe_id: string;
  departement: string;
  jours: number;
  montant: number;
  statut: StatutPortefeuille;
}

// TODO: remplacer par GET /paiement/historique (avec pagination & filtres back)
const FAKE: LignePaiement[] = [
  { id: 1, date: '2025-05-12', employe_nom: 'Jean Dupont',  employe_id: 'EMP001', departement: 'Comptabilité', jours: 12, montant: 180000, statut: StatutPortefeuille.PAYE },
  { id: 2, date: '2025-05-10', employe_nom: 'Marie Martin', employe_id: 'EMP002', departement: 'RH',           jours: 8,  montant: 120000, statut: StatutPortefeuille.PAYE },
  { id: 3, date: '2025-05-07', employe_nom: 'Paul Kana',    employe_id: 'EMP003', departement: 'Technique',    jours: 15, montant: 225000, statut: StatutPortefeuille.CONFIRME_RH },
  { id: 4, date: '2025-05-05', employe_nom: 'Léa Essomba',  employe_id: 'EMP004', departement: 'Production',  jours: 6,  montant: 90000,  statut: StatutPortefeuille.PAYE },
  { id: 5, date: '2025-04-28', employe_nom: 'Sophie Biya',  employe_id: 'EMP005', departement: 'Finance',     jours: 5,  montant: 75000,  statut: StatutPortefeuille.PAYE },
  { id: 6, date: '2025-04-25', employe_nom: 'Alain Mbarga', employe_id: 'EMP006', departement: 'Logistique',  jours: 20, montant: 300000, statut: StatutPortefeuille.PAYE },
  { id: 7, date: '2025-04-15', employe_nom: 'Claudine Ngo', employe_id: 'EMP007', departement: 'Production',  jours: 9,  montant: 135000, statut: StatutPortefeuille.PAYE },
];

const DEPTS   = ['Tous', 'Comptabilité', 'RH', 'Technique', 'Production', 'Finance', 'Logistique'];
const CHIPS   = ["Aujourd'hui", '7 derniers jours', '30 jours', 'Ce mois', 'Trimestre', 'Cette année'];
const LIMIT   = 5;

const STATUT_CLR: Record<StatutPortefeuille, string> = {
  [StatutPortefeuille.PAYE]:        'success',
  [StatutPortefeuille.CONFIRME_RH]: 'primary',
  [StatutPortefeuille.EN_ATTENTE]:  'warning',
  [StatutPortefeuille.IMPAYE]:      'danger',
};

const col = createColumnHelper<LignePaiement>();

// ── Composant ──────────────────────────────────────────────────────────────────
const HistoriquePaiements: React.FC = () => {
  document.title = 'Historique paiements | Velzon';

  const [search,     setSearch]     = useState('');
  const [dept,       setDept]       = useState('Tous');
  const [dateRange,  setDateRange]  = useState<Date[]>([]);
  const [activeChip, setActiveChip] = useState('');
  const [sorting,    setSorting]    = useState<SortingState>([]);
  const [page,       setPage]       = useState(1);

  const fmt     = (n: number) => n.toLocaleString('fr-FR') + ' F';
  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });

  // Chip → plage de dates
  const handleChip = (chip: string) => {
    const now  = new Date();
    const from = new Date();
    if      (chip === "Aujourd'hui")       from.setHours(0, 0, 0, 0);
    else if (chip === '7 derniers jours')  from.setDate(now.getDate() - 7);
    else if (chip === '30 jours')          from.setDate(now.getDate() - 30);
    else if (chip === 'Ce mois')           from.setDate(1);
    else if (chip === 'Trimestre')         from.setMonth(now.getMonth() - 3);
    else if (chip === 'Cette année')       from.setMonth(0, 1);
    setDateRange([from, now]);
    setActiveChip(chip);
    setPage(1);
  };

  // Filtrage
  const filtered = useMemo(() => {
    let d = FAKE;
    if (search) d = d.filter(l =>
      l.employe_nom.toLowerCase().includes(search.toLowerCase()) ||
      l.employe_id.toLowerCase().includes(search.toLowerCase())
    );
    if (dept !== 'Tous') d = d.filter(l => l.departement === dept);
    if (dateRange.length === 2) {
      const [from, to] = dateRange;
      d = d.filter(l => { const dd = new Date(l.date); return dd >= from && dd <= to; });
    }
    return d;
  }, [search, dept, dateRange]);

  const paginated  = useMemo(() => filtered.slice((page - 1) * LIMIT, page * LIMIT), [filtered, page]);
  const totalPages = Math.ceil(filtered.length / LIMIT);

  // Stats calculées sur les données filtrées
  const stats = useMemo(() => ({
    total:    filtered.reduce((a, l) => a + l.montant, 0),
    count:    filtered.length,
    moyenne:  filtered.length ? Math.round(filtered.reduce((a, l) => a + l.montant, 0) / filtered.length) : 0,
    employes: new Set(filtered.map(l => l.employe_id)).size,
  }), [filtered]);

  // Colonnes
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
      id: 'actions', header: 'Actions',
      cell: ({ row }) => (
        <div className="d-flex gap-1">
          <Link
            to={`/paiements/portefeuille/${row.original.id}`}
            className="btn btn-soft-primary btn-sm d-flex align-items-center gap-1"
          >
            <i className="ri-eye-line" />Détail
          </Link>
          <button className="btn btn-soft-success btn-sm d-flex align-items-center gap-1">
            <i className="ri-download-line" />PDF
          </button>
        </div>
      ),
    }),
  ], []);

  const table = useReactTable({
    data: paginated,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: row => String(row.id),
    manualPagination: true,
  });

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <BreadCrumb title="Historique des paiements" pageTitle="Paiements" />

          {/* Widgets stats — réactifs aux filtres */}
          <Row className="mb-3">
            {[
              { label: 'Total payé',       val: stats.total,    suffix: ' F', icon: 'credit-card',  color: 'primary', cap: 'Données filtrées' },
              { label: 'Paiements',         val: stats.count,    suffix: '',   icon: 'check-circle', color: 'success', cap: 'Opérations' },
              { label: 'Moy. / paiement',   val: stats.moyenne,  suffix: ' F', icon: 'trending-up',  color: 'warning', cap: 'Par opération' },
              { label: 'Employés couverts', val: stats.employes, suffix: '',   icon: 'users',         color: 'info',    cap: 'Bénéficiaires' },
            ].map(w => (
              <Col xl={3} key={w.label}>
                <Card className="card-animate" style={{ borderTop: `3px solid var(--vz-${w.color})` }}>
                  <CardBody>
                    <div className="d-flex align-items-center">
                      <div className="avatar-sm flex-shrink-0">
                        <span className={`avatar-title bg-${w.color}-subtle text-${w.color} rounded-2 fs-2`}>
                          <FeatherIcon icon={w.icon} className={`text-${w.color} icon-sm`} />
                        </span>
                      </div>
                      <div className="flex-grow-1 ms-3 overflow-hidden">
                        <p className="text-uppercase fw-medium text-muted text-truncate mb-2">{w.label}</p>
                        <h4 className={`fs-4 mb-1 text-${w.color}`}>
                          <CountUp start={0} end={w.val} suffix={w.suffix} separator=" " duration={1} />
                        </h4>
                        <p className="text-muted fs-13 mb-0">{w.cap}</p>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </Col>
            ))}
          </Row>

          {/* Tableau principal */}
          <Card>
            <CardHeader className="d-flex align-items-center border-bottom flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                <div className="rounded-1" style={{ width: 4, height: 18, background: 'var(--vz-primary)' }} />
                <h4 className="card-title mb-0">Historique des paiements</h4>
                <Badge color="primary" className="bg-primary-subtle text-primary">{filtered.length}</Badge>
              </div>
              <button className="btn btn-soft-success btn-sm d-flex align-items-center gap-1">
                <i className="ri-file-excel-line" />Exporter CSV
              </button>
            </CardHeader>

            {/* Filtres */}
            <div className="p-3 border-bottom">
              <Row className="g-2 align-items-end mb-2">
                <Col sm={6} md={3}>
                  <label className="form-label text-uppercase fw-medium text-muted fs-11 mb-1">Plage de dates</label>
                  <Flatpickr
                    className="form-control form-control-sm"
                    placeholder="Début → Fin"
                    value={dateRange}
                    options={{ mode: 'range', dateFormat: 'd M, Y' }}
                    onChange={(dates: Date[]) => {
                      setDateRange(dates);
                      setActiveChip('Personnalisé');
                      setPage(1);
                    }}
                  />
                </Col>
                <Col sm={6} md={3}>
                  <label className="form-label text-uppercase fw-medium text-muted fs-11 mb-1">Employé</label>
                  <div className="search-box">
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Nom ou matricule…"
                      value={search}
                      onChange={e => { setSearch(e.target.value); setPage(1); }}
                    />
                    <i className="ri-search-line search-icon" />
                  </div>
                </Col>
                <Col sm={6} md={2}>
                  <label className="form-label text-uppercase fw-medium text-muted fs-11 mb-1">Département</label>
                  <select
                    className="form-select form-select-sm"
                    value={dept}
                    onChange={e => { setDept(e.target.value); setPage(1); }}
                  >
                    {DEPTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </Col>
                <Col sm="auto" className="d-flex gap-2">
                  <button
                    className="btn btn-soft-secondary btn-sm d-flex align-items-center gap-1"
                    onClick={() => { setSearch(''); setDept('Tous'); setDateRange([]); setActiveChip(''); setPage(1); }}
                  >
                    <i className="ri-refresh-line" />Réinitialiser
                  </button>
                </Col>
              </Row>

              {/* Chips période rapide */}
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <span className="text-muted fs-12">Période rapide :</span>
                {CHIPS.map(c => (
                  <button
                    key={c}
                    className={`btn btn-sm rounded-pill ${activeChip === c ? 'btn-primary' : 'btn-outline-secondary'}`}
                    style={{ padding: '2px 12px', fontSize: 11 }}
                    onClick={() => handleChip(c)}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <CardBody>
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
                            {h.column.getIsSorted() === 'asc'  && <i className="ri-arrow-up-s-line ms-1" />}
                            {h.column.getIsSorted() === 'desc' && <i className="ri-arrow-down-s-line ms-1" />}
                            {!h.column.getIsSorted() && h.column.getCanSort() && (
                              <i className="ri-expand-up-down-line ms-1 text-muted" style={{ opacity: .35 }} />
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
                  <span className="fw-semibold">{Math.min((page-1)*LIMIT+1, filtered.length)}–{Math.min(page*LIMIT, filtered.length)}</span>
                  {' '}sur{' '}
                  <span className="fw-semibold">{filtered.length}</span>
                </div>
                <ul className="pagination pagination-separated pagination-sm mb-0">
                  <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                    <Link to="#" className="page-link" onClick={() => setPage(p => p - 1)}>←</Link>
                  </li>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                    <li key={p} className={`page-item ${p === page ? 'active' : ''}`}>
                      <Link to="#" className="page-link" onClick={() => setPage(p)}>{p}</Link>
                    </li>
                  ))}
                  <li className={`page-item ${page === totalPages ? 'disabled' : ''}`}>
                    <Link to="#" className="page-link" onClick={() => setPage(p => p + 1)}>→</Link>
                  </li>
                </ul>
              </div>
            </CardBody>
          </Card>

        </Container>
      </div>
    </React.Fragment>
  );
};

export default HistoriquePaiements;