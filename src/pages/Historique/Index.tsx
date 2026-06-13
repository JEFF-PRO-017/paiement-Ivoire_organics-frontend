import React from 'react';
import { Badge, Card, CardBody, CardHeader, Container } from 'reactstrap';

import StatsWidgets from './Composants/StatsWidgets';
import FiltresHistorique from './Composants/FiltresHistorique';
import TableauHistorique from './Composants/TableauHistorique';
import { useHistoriquePaiements } from './Hook/useHistoriquePaiements';

const HistoriquePaiements: React.FC = () => {
  document.title = 'Historique paiements | Ivoire Organics';  // Titre de page générique

  const {
    rows, stats, isLoading,          // ← plus paginated/filtered
    sorting, onSortingChange,
    filtres, setSearch, setDept, setDateRange, handleChip, handleReset,
    page, pageSize, totalPages, totalCount,   // ← totalCount ajouté
    setPage, setPageSize,
    handleExportCSV, handleExportPDF, handleExportPDFLigne,
  } = useHistoriquePaiements();

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>

          <StatsWidgets stats={stats} />

          <Card>
            <CardHeader className="d-flex align-items-center border-bottom flex-wrap gap-2">
              <div className="d-flex align-items-center gap-2 flex-grow-1">
                <div className="rounded-1" style={{ width: 4, height: 18, background: 'var(--vz-primary)' }} />
                <h4 className="card-title mb-0">Historique des paiements</h4>
                <Badge color="primary" className="bg-primary-subtle text-primary">
                  {totalCount}  {/* ← total renvoyé par le back */}
                </Badge>
              </div>

              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
                  onClick={handleExportCSV}
                  disabled={isLoading || totalCount === 0}
                >
                  <i className="ri-file-excel-line" />Exporter CSV
                </button>
                <button
                  className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1"
                  onClick={handleExportPDF}
                  disabled={isLoading || totalCount === 0}
                >
                  <i className="ri-file-pdf-line" />Exporter PDF
                </button>
              </div>
            </CardHeader>

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
                  data={rows}
                  page={page}
                  pageSize={pageSize}
                  totalPages={totalPages}
                  sorting={sorting}
                  onSortingChange={onSortingChange}
                  onPageChange={setPage}
                  onPageSizeChange={setPageSize}
                  onExportPDF={handleExportPDFLigne}
                  totalCount={totalCount}
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