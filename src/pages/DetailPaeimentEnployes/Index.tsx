import React from 'react';
import { Container, Row, Col, Card, CardBody, Spinner } from 'reactstrap';
import { useNavigate } from 'react-router-dom';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import BootstrapTheme from '@fullcalendar/bootstrap';
import multiMonthPlugin from '@fullcalendar/multimonth';
import listPlugin from '@fullcalendar/list';

import EmployeSidebar from './Composants/EmployeSidebar';
import { fmt } from 'pages/Utils/Utils';
import ConfirmationModal from './Composants/Confirmationmodal';
import { useDetailEmploye } from './Hook/Usedetailemploye';
import BreadCrumb from 'Components/Common/BreadCrumb';
import PortefeuilleNavBar from './Composants/navigation/PortefeuilleNavBar';



const DetailEmploye: React.FC = () => {
    const navigate = useNavigate();

    const {
        group, isLoading,
        navQueue, navIndex, setNavIndex,
        calendarEvents,
        enAttenteIds, impayeIds, montantEnAttente, montantImpaye,
        confirmationAction, ouvrirConfirmation, fermerConfirmation, handleConfirmer,
        handleEventClick,
    } = useDetailEmploye();

    const allerVers = (index: number) => {
        const cible = navQueue[index];
        if (!cible) return;
        setNavIndex(index);
        navigate(`/paiement/${cible.id}`, { state: { queue: navQueue, index } });
    };

    const peutPrecedent = navIndex > 0;
    const peutSuivant = navIndex < navQueue.length - 1;

    if (isLoading && !group) {
        return (
            <div className="page-content">
                <Container fluid>
                    <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
                        <Spinner color="primary" />
                    </div>
                </Container>
            </div>
        );
    }

    if (!group) return null;

    return (
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
                    {/* ── Colonne gauche : infos employé + actions ── */}
                    <Col xl={4} lg={5}>
                        <EmployeSidebar
                            group={group}
                            loading={isLoading}
                            enAttenteCount={enAttenteIds.length}
                            impayeCount={impayeIds.length}
                            montantEnAttente={montantEnAttente}
                            montantImpaye={montantImpaye}
                            onConfirmerRH={() => ouvrirConfirmation('confirmer_rh')}
                            onMarquerPaye={() => ouvrirConfirmation('marquer_paye')}
                        />
                    </Col>

                    {/* ── Colonne droite : calendrier des pointages ── */}
                    <Col xl={8} lg={7}>
                        <Card className="card-h-100">
                            <CardBody>
                                <h5 className="mb-3">Calendrier des pointages</h5>
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
                                    editable={true}
                                    selectable={true}
                                    eventClick={handleEventClick}
                                    eventDidMount={(info) => {
                                        const { statut_label, montant_journalier } = info.event.extendedProps;
                                        info.el.setAttribute(
                                            'title',
                                            `Statut: ${statut_label} — Montant: ${fmt(parseFloat(montant_journalier))}`
                                        );
                                    }}
                                    locale="fr"
                                    buttonText={{
                                        month: 'Mois',
                                        multiMonthYear: 'Année',
                                    }}
                                />
                            </CardBody>
                        </Card>
                    </Col>
                </Row>

            </Container>

            <ConfirmationModal
                action={confirmationAction}
                nbConcernes={confirmationAction === 'confirmer_rh' ? enAttenteIds.length : impayeIds.length}
                montant={fmt(confirmationAction === 'confirmer_rh' ? montantEnAttente : montantImpaye)}
                loading={isLoading}
                onCancel={fermerConfirmation}
                onConfirm={handleConfirmer}
            />
        </div>
    );
};

export default DetailEmploye;