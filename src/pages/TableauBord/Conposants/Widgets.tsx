import React from 'react';
import CountUp from 'react-countup';
import FeatherIcon from 'feather-icons-react';
import { Card, CardBody, Col, Row } from 'reactstrap';
import { DashboardStats } from '../../Utils/types';

interface Props { stats: DashboardStats; }

const ITEMS = [
  {
    key:     'nombre_employes'      as keyof DashboardStats,
    label:   'Employés actifs',
    caption: 'Statut ACTIF',
    icon:    'users',
    color:   'primary',
    suffix:  '',
  },
  {
    key:     'somme_totale_en_attente'  as keyof DashboardStats,
    label:   'Somme non Confimée',
    caption: 'En attente de confirmation',
    icon:    'calendar',
    color:   'warning',
    suffix:  ' XOF',
  },
  {
    key:     'somme_totale_impaye' as keyof DashboardStats,
    label:   'Somme Confimée',
    caption: 'Montant à décaisser',
    icon:    'credit-card',
    color:   'success',
    suffix:  ' XOF',
  },
];

const Widgets: React.FC<Props> = ({ stats }) => (
  <React.Fragment>
    <Row>
      {ITEMS.map(item => (
        <Col lg={4} key={item.key}>
          {/* card-animate : effet hover natif  */}
          <Card className="card-animate "
            style={{ borderTop: `3px solid var(--vz-${item.color})` }}>
            <CardBody>
              <div className="d-flex align-items-center">

                {/* Icône dans avatar carré arrondi */}
                <div className="avatar-sm flex-shrink-0">
                  <span className={`avatar-title bg-${item.color}-subtle text-${item.color} rounded-2 fs-2`}>
                    <FeatherIcon icon={item.icon} className={`text-${item.color} icon-sm`} />
                  </span>
                </div>

                <div className="flex-grow-1 overflow-hidden ms-3">
                  <p className="text-uppercase fw-medium text-muted text-truncate mb-2">
                    {item.label}
                  </p>
                  <h4 className={`fs-4 flex-grow-1 mb-1 text-${item.color}`}>
                    <CountUp
                      start={0}
                      end={stats[item.key] as number}
                      suffix={item.suffix}
                      separator=" "
                      duration={3}
                    />
                  </h4>
                  <p className="text-muted text-truncate mb-0 fs-13">{item.caption}</p>
                </div>

              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  </React.Fragment>
);

export default Widgets;