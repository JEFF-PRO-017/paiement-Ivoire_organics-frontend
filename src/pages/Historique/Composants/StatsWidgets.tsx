/*
  StatsWidgets.tsx
  Affiche les 4 cartes de statistiques réactives aux filtres.
*/

import React from 'react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import CountUp from 'react-countup';
import FeatherIcon from 'feather-icons-react';
import { StatsHistorique } from '../Hook/historique.types';

interface Props {
    stats: StatsHistorique;
}

const WIDGETS = [
    { key: 'total' as const, label: 'Total payé', suffix: ' F', icon: 'credit-card', color: 'primary', cap: 'Données filtrées' },
    { key: 'count' as const, label: 'Paiements', suffix: '', icon: 'check-circle', color: 'success', cap: 'Opérations' },
    { key: 'moyenne' as const, label: 'Moy. / paiement', suffix: ' F', icon: 'trending-up', color: 'warning', cap: 'Par opération' },
    { key: 'employes' as const, label: 'Employés couverts', suffix: '', icon: 'users', color: 'info', cap: 'Bénéficiaires' },
] as const;

const StatsWidgets: React.FC<Props> = ({ stats }) => (
    <Row className="mb-3">
        {WIDGETS.map(w => (
            <Col xl={3} key={w.key}>
                <Card className="card-animate">
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
                                    <CountUp start={0} end={stats[w.key]} suffix={w.suffix} separator=" " duration={1} />
                                </h4>
                                <p className="text-muted fs-13 mb-0">{w.cap}</p>
                            </div>
                        </div>
                    </CardBody>
                </Card>
            </Col>
        ))}
    </Row>
);

export default StatsWidgets;