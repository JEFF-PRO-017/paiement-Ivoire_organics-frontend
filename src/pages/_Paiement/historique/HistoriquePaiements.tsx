import React from 'react';
import { Badge, Card, CardBody, CardHeader, Container } from 'reactstrap';

import StatsWidgets             from './StatsWidgets';
import FiltresHistorique        from './FiltresHistorique';
import TableauHistorique        from './TableauHistorique';
import { useHistoriquePaiements } from './useHistoriquePaiements';
import BreadCrumb from 'Components/Common/BreadCrumb';

const HistoriquePaiements: React.FC = () => {
  document.title = 'Historique paiements | Velzon';

  const {
    paginated, filtered, stats, isLoading,
    sorting, onSortingChange,
    filtres, setSearch, setDept, setDateRange, handleChip, handleReset,
    page, totalPages, setPage,
    handleExportCSV, handleExportPDF, handleExportPDFLigne,
  } = useHistoriquePaiements();


  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>

          {/* ── Widgets stats avec dropdowns ── */}
          <StatsWidgets stats={stats}  />

          {/* ── Tableau principal ── */}
          <Card>
            <CardHeader className="d-flex align-items-center border-bottom flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                <div
                  className="rounded-1"
                  style={{ width: 4, height: 18, background: 'var(--vz-primary)' }}
                />
                <h4 className="card-title mb-0">Historique des paiements</h4>
                <Badge color="primary" className="bg-primary-subtle text-primary">
                  {filtered.length}
                </Badge>
              </div>

              {/* ── Boutons d'export ── */}
              <div className="d-flex gap-2">
                <button
                  className="btn btn-soft-success btn-sm d-flex align-items-center gap-1"
                  onClick={handleExportCSV}
                  disabled={isLoading || filtered.length === 0}
                >
                  <i className="ri-file-excel-line" />Exporter CSV
                </button>
                <button
                  className="btn btn-soft-danger btn-sm d-flex align-items-center gap-1"
                  onClick={handleExportPDF}
                  disabled={isLoading || filtered.length === 0}
                >
                  <i className="ri-file-pdf-line" />Exporter PDF
                </button>
              </div>
            </CardHeader>

            {/* ── Filtres ── */}
            <FiltresHistorique
              filtres={filtres}
              onSearch={setSearch}
              onDept={setDept}
              onDateRange={setDateRange}
              onChip={handleChip}
              onReset={handleReset}
            />

            <CardBody>
              {isLoading ? (
                <div className="text-center py-5 text-muted">
                  <span className="spinner-border spinner-border-sm me-2" />
                  Chargement…
                </div>
              ) : (
                <TableauHistorique
                  paginated={paginated}
                  filtered={filtered}
                  page={page}
                  totalPages={totalPages}
                  sorting={sorting}
                  onSortingChange={onSortingChange}
                  onPageChange={setPage}
                  onExportPDF={handleExportPDFLigne}
                />
              )}
            </CardBody>
          </Card>

        </Container>
      </div>
    </React.Fragment>
  );
};

export default HistoriquePaiements;