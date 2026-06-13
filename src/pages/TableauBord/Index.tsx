import React, { useEffect, useState } from 'react';
import { Col, Container, Row } from 'reactstrap';

import Widgets from './Conposants/Widgets';
import CalendrierPaiement from './Conposants/CalendrierPaiement';
import TableauEnAttente from './Conposants/TableauEnAttente';
import TableauImpayes from './Conposants/TableauImpayes';
import SectionWrapper from './Conposants/SectionWrapper';
import { useDashboard, SectionKey } from './Hook/useDashboard';

// ─── Styles injectés une seule fois dans le <head> ───────────────────────────
const STYLES = `
  .section-wrapper .btn-close-section { opacity: 0; transition: opacity 0.2s ease; }
  .section-wrapper:hover .btn-close-section { opacity: 1; }

  .section-fade-in  { animation: secIn  0.35s ease forwards; }
  .section-fade-out { animation: secOut 0.28s ease forwards; }
  @keyframes secIn  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
  @keyframes secOut { from { opacity:1; transform:translateY(0); }   to { opacity:0; transform:translateY(-10px); } }

  .flatpickr-day.jour-cumule,
  .flatpickr-day.jour-cumule:hover {
    background: #c9a227 !important;
    border-color: #c9a227 !important;
    color: #fff !important;
    border-radius: 50% !important;
  }
`;

const injectStyles = () => {
  const id = 'dashboard-paiement-styles';
  if (document.getElementById(id)) return;
  const tag = document.createElement('style');
  tag.id = id;
  tag.textContent = STYLES;
  document.head.appendChild(tag);
};

// ─── Squelette Bootstrap placeholder ─────────────────────────────────────────
const Skel: React.FC<{ h?: number; cols?: number }> = ({ h = 130, cols = 1 }) => (
  <Row>
    {Array.from({ length: cols }).map((_, i) => (
      <Col key={i} xl={12 / cols as any}>
        <div className="card placeholder-glow mb-0" style={{ height: h }}>
          <div className="card-body">
            <span className="placeholder col-12 h-100 rounded" />
          </div>
        </div>
      </Col>
    ))}
  </Row>
);

// ─── Labels sections ──────────────────────────────────────────────────────────
const LABELS: Record<SectionKey, string> = {
  s1: 'Statistiques', s2: 'Calendrier', s3: 'En attente', s4: 'Impayés',
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const DashboardPaiement: React.FC = () => {
  document.title = 'Paiements | IVOIRE-ORGANICS';

  useEffect(() => { injectStyles(); }, []);

  const {
    stats, jours, historique,
    enAttente, impayes,
    pageEA,  pageSizeEA,
    pageIMP, pageSizeIMP,
    visible, toggle, hide,
    allHidden,
    handlePageEA,  handlePageSizeEA,
    handlePageIMP, handlePageSizeIMP,
    handleConfirmerRH,
  } = useDashboard();

  const [ws1_s3, setWs1_s3] = useState(8);
  const [ws2,    setWs2]    = useState(4);

  useEffect(() => {
    const s2Visible   = visible.s2 === true;
    const leftVisible = visible.s1 === true || visible.s3 === true;

    if (!s2Visible && !leftVisible) { setWs1_s3(0); setWs2(0);  return; }
    if (!s2Visible)                 { setWs1_s3(12); setWs2(0); return; }
    if (!leftVisible)               { setWs1_s3(0); setWs2(12); return; }
    setWs1_s3(8); setWs2(4);
  }, [visible]);

  const hiddenKeys = (Object.keys(visible) as SectionKey[]).filter(k => visible[k] === false);

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>

          {/* Barre restauration */}
          {hiddenKeys.length > 0 && (
            <div className="d-flex flex-wrap gap-2 mb-3">
              {hiddenKeys.map(k => (
                <button
                  key={k}
                  className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
                  onClick={() => toggle(k)}
                >
                  <i className="ri-eye-line" /> {LABELS[k]}
                </button>
              ))}
            </div>
          )}

          {/* Message vide */}
          {allHidden && (
            <div className="text-center py-5 text-muted">
              <i className="ri-layout-row-line display-4 d-block mb-3" />
              <h5 className="text-muted">Aucune section affichée</h5>
              <p className="mb-0 fs-13">Utilisez les boutons ci-dessus pour restaurer une section.</p>
            </div>
          )}

          {/* ── Layout 8/12 + 4/12 ── */}
          <Row className="project-wrapper">

            <Col lg={ws1_s3}>

              {/* Section 1 — Widgets */}
              <SectionWrapper
                sectionKey="s1" label="Statistiques"
                visible={visible.s1} onClose={hide}
                // skeleton={<Skel h={110} cols={3} />}
              >
                {stats && <Widgets stats={stats} />}
              </SectionWrapper>

              {/* Section 3 — EN_ATTENTE */}
              <SectionWrapper
                sectionKey="s3" label="En attente"
                visible={visible.s3} onClose={hide}
                // skeleton={<Skel h={260} />}
              >
                {enAttente && (
                  <Row className="mt-3">
                    <TableauEnAttente
                      data={enAttente}
                      page={pageEA}
                      pageSize={pageSizeEA}
                      onPageChange={handlePageEA}
                      onPageSizeChange={handlePageSizeEA}
                      onConfirmerRH={handleConfirmerRH}
                    />
                  </Row>
                )}
              </SectionWrapper>

            </Col>

            <Col lg={ws2}>
              {/* Section 2 — Calendrier */}
              <SectionWrapper
                sectionKey="s2" label="Calendrier"
                visible={visible.s2} onClose={hide}
                // skeleton={<div className="col-xxl-4"><Skel h={440} /></div>}
              >
                <CalendrierPaiement joursCumules={jours} historique={historique} />
              </SectionWrapper>
            </Col>

          </Row>

          {/* Section 4 — IMPAYÉS pleine largeur */}
          <Row>
            <SectionWrapper
              sectionKey="s4" label="Impayés"
              visible={visible.s4} onClose={hide}
              // skeleton={<Skel h={260} />}
            >
              {impayes && (
                <TableauImpayes
                  data={impayes}
                  page={pageIMP}
                  pageSize={pageSizeIMP}
                  onPageChange={handlePageIMP}
                  onPageSizeChange={handlePageSizeIMP}
                />
              )}
            </SectionWrapper>
          </Row>

        </Container>
      </div>

      {/* <ToastContainer position="top-right" autoClose={3000} /> */}
    </React.Fragment>
  );
};

export default DashboardPaiement;