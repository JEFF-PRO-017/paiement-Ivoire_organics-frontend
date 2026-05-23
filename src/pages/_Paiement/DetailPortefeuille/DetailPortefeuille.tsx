import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';
import { Spinner } from 'reactstrap';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import BootstrapTheme from '@fullcalendar/bootstrap';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';

import BreadCrumb from 'Components/Common/BreadCrumb';
import EmployeSidebar from './EmployeSidebar';
import ModalEmpreinte from './ModalEmpreinte';
import PortefeuilleNavBar from './navigation/PortefeuilleNavBar';
import { useDetailPortefeuille } from './useDetailPortefeuille';

// ── Skeleton ──────────────────────────────────────────────────────────────────
// Affiché pendant le chargement des données de l'employé

const SkeletonPulse: React.FC<{ height?: number; className?: string }> = ({
    height = 16,
    className = '',
}) => (
    <div
        className={`rounded ${className}`}
        style={{
            height,
            background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
            backgroundSize: '200% 100%',
            animation: 'skeleton-shimmer 1.4s infinite',
        }}
    />
);

const SidebarSkeleton: React.FC = () => (
    <Card>
        <CardBody className="d-flex flex-column gap-3">
            {/* Avatar + nom */}
            <div className="d-flex align-items-center gap-3">
                <div className="rounded-circle bg-light flex-shrink-0" style={{ width: 56, height: 56 }} />
                <div className="flex-grow-1 d-flex flex-column gap-2">
                    <SkeletonPulse height={14} className="w-75" />
                    <SkeletonPulse height={11} className="w-50" />
                </div>
            </div>
            {/* Lignes infos */}
            {[80, 60, 70, 55, 65].map((w, i) => (
                <SkeletonPulse key={i} height={13} className={`w-${w}`} />
            ))}
            {/* Boutons */}
            <div className="d-flex gap-2 mt-2">
                <SkeletonPulse height={34} className="flex-grow-1 rounded" />
                <SkeletonPulse height={34} className="flex-grow-1 rounded" />
            </div>
        </CardBody>
    </Card>
);

const CalendarSkeleton: React.FC = () => (
    <Card className="card-h-100">
        <CardBody className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: 420 }}>
            <Spinner color="primary" style={{ width: 36, height: 36 }} />
            <p className="text-muted mt-3 mb-0" style={{ fontSize: 13 }}>
                Chargement du calendrier…
            </p>
        </CardBody>
    </Card>
);

// ── Composant principal ───────────────────────────────────────────────────────

const DetailPortefeuille: React.FC = () => {
    const navigate = useNavigate();

    const {
        pf,
        isLoading,
        navQueue,
        navIndex,
        calendarEvents,
        modalEmpreinteOpen,
        actionEmpreinte,
        setNavIndex,
        ouvrirEmpreinte,
        fermerEmpreinte,
        handleConfirmEmpreinte,
        handleReset,
        handleEventClick,
    } = useDetailPortefeuille();

    console.log('DétailPortefeuille rendu', { pf, isLoading, navQueue, navIndex, calendarEvents });
    // ── Guard ─────────────────────────────────────────────────────────────────

    if (!isLoading && (!pf || !pf.employe)) {
        return (
            <div className="page-content">
                <Container fluid>
                    <div className="text-center py-5 text-muted">
                        <i className="ri-file-damage-line display-4 d-block mb-3" />
                        <h5>Portefeuille introuvable</h5>
                        <button
                            className="btn btn-soft-primary btn-sm mt-2"
                            onClick={() => navigate('/paiements')}
                        >
                            ← Retour
                        </button>
                    </div>
                </Container>
            </div>
        );
    }

    // ── Rendu ─────────────────────────────────────────────────────────────────

    return (
        <React.Fragment>
            {/* Keyframes skeleton dans le head via style tag */}
            <style>{`
                @keyframes skeleton-shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Détail portefeuille" pageTitle="Paiements" />

                    {/* ── Barre de navigation entre employés ── */}
                    <PortefeuilleNavBar
                        queue={navQueue}
                        currentIndex={navIndex}
                        onIndexChange={setNavIndex}   // ← nouveau
                    />

                    <Row>
                        <Col xs={12}>
                            <Row>

                                {/* ══ SIDEBAR xl=3 ══ */}
                                <Col xl={3}>
                                    {isLoading ? (
                                        <SidebarSkeleton />
                                    ) : (
                                        <EmployeSidebar
                                            pf={pf!}
                                            loading={isLoading}
                                            onOuvrirEmpreinte={ouvrirEmpreinte}
                                            onReset={handleReset}
                                        />
                                    )}
                                </Col>

                                {/* ══ CALENDRIER xl=9 ══ */}
                                <Col xl={9}>
                                    {isLoading ? (
                                        <CalendarSkeleton />
                                    ) : (
                                        <Card className="card-h-100">
                                            <CardBody>
                                                <FullCalendar
                                                    plugins={[
                                                        BootstrapTheme,
                                                        dayGridPlugin,
                                                        interactionPlugin,
                                                        listPlugin,
                                                        multiMonthPlugin,
                                                    ]}
                                                    initialView="dayGridMonth"
                                                    handleWindowResize={true}
                                                    themeSystem="bootstrap"
                                                    headerToolbar={{
                                                        left: 'prev,next today',
                                                        center: 'title',
                                                        right: 'multiMonthYear,dayGridMonth,dayGridWeek,listWeek',
                                                    }}
                                                    events={calendarEvents}
                                                    editable={false}
                                                    selectable={false}
                                                    eventClick={handleEventClick}
                                                    locale="fr"
                                                    buttonText={{
                                                        month: 'Mois',
                                                        multiMonthYear: 'Année',
                                                    }}
                                                />
                                            </CardBody>
                                        </Card>
                                    )}
                                </Col>

                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* ── Modal empreinte digitale USB ── */}
            {pf && (
                <ModalEmpreinte
                    isOpen={modalEmpreinteOpen}
                    action={actionEmpreinte}
                    employeId={pf.employe_id}
                    loading={isLoading}
                    onConfirm={handleConfirmEmpreinte}
                    onCancel={fermerEmpreinte}
                />
            )}
        </React.Fragment>
    );
};

export default DetailPortefeuille;