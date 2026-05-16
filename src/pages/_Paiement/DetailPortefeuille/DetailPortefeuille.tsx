import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardBody, Col, Container, Row } from 'reactstrap';

import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import BootstrapTheme from '@fullcalendar/bootstrap';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';

import BreadCrumb from 'Components/Common/BreadCrumb';
import EmployeSidebar from './EmployeSidebar';
import ModalEmpreinte from './ModalEmpreinte';
import { useDetailPortefeuille } from './useDetailPortefeuille';

// ── Composant principal ───────────────────────────────────────────────────────

const DetailPortefeuille: React.FC = () => {
    const navigate = useNavigate();

    const {
        pf,
        isLoading,
        calendarEvents,
        modalEmpreinteOpen,
        actionEmpreinte,
        ouvrirEmpreinte,
        fermerEmpreinte,
        handleConfirmEmpreinte,
        handleReset,
        handleEventClick,
    } = useDetailPortefeuille();

    // ── Guard ─────────────────────────────────────────────────────────────────

    if (!pf || !pf.employe) {
        return (
            <div className="page-content">
                <Container fluid>
                    <div className="text-center py-5 text-muted">
                        <i className="ri-file-damage-line display-4 d-block mb-3" />
                        <h5>Portefeuille introuvable</h5>
                        <button
                            className="btn btn-soft-primary btn-sm mt-2"
                            onClick={() => navigate('/paiements/historique')}
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
            <div className="page-content">
                <Container fluid>
                    <BreadCrumb title="Détail portefeuille" pageTitle="Paiements" />

                    <Row>
                        <Col xs={12}>
                            <Row>

                                {/* ══ SIDEBAR xl=3 ══ */}
                                <Col xl={3}>
                                    <EmployeSidebar
                                        pf={pf}
                                        loading={isLoading}
                                        onOuvrirEmpreinte={ouvrirEmpreinte}
                                        onReset={handleReset}
                                    />

                                </Col>
                                {/* ══ CALENDRIER xl=9 ══ */}
                                <Col xl={9}>
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
                                                    // today: "Aujourd'hui",
                                                    month: 'Mois',
                                                    // week: 'Semaine',
                                                    // list: 'Liste',
                                                    multiMonthYear: 'Année',
                                                }}
                                            />
                                        </CardBody>
                                    </Card>
                                </Col>

                            </Row>
                        </Col>
                    </Row>
                </Container>
            </div>

            {/* ── Modal empreinte digitale USB ── */}
            <ModalEmpreinte
                isOpen={modalEmpreinteOpen}
                action={actionEmpreinte}
                employeId={pf.employe_id}
                loading={isLoading}
                onConfirm={handleConfirmEmpreinte}
                onCancel={fermerEmpreinte}
            />
        </React.Fragment>
    );
};

export default DetailPortefeuille;