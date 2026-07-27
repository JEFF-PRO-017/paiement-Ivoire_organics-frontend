import React from 'react';
import Flatpickr from 'react-flatpickr';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Badge, Row, Col, Table,
} from 'reactstrap';
import { EmployeAttendanceGroup, StatutEmploye } from '../../Utils/types';

interface Props {
  group: EmployeAttendanceGroup | null;
  isOpen: boolean;
  toggle: () => void;
  onViewPortefeuille?: (row: EmployeAttendanceGroup) => void;
  onConfirmerRH?: (ids: number[]) => void;
}

const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';

const ModalDetailEmploye: React.FC<Props> = ({ group, isOpen, toggle, onViewPortefeuille, onConfirmerRH }) => {
  const g = group;
  const emp = g?.employe;
  const attendances = g?.attendance_list ?? [];

  const initiales = emp?.nom_complet.split(' ').map(n => n[0]).slice(0, 2).join('') ?? '';
  const nbJours = attendances.length;
  const montantDu = attendances.reduce((acc, a) => acc + parseFloat(a.montant_journalier), 0);
  const totalHeures = attendances.reduce((acc, a) => acc + a.worked_hours, 0);
  const enAttenteIds = attendances.filter(a => a.statut_paiement === 'EN_ATTENTE').map(a => a.id);

  // dates enregistrées, pour le calendrier lecture seule
  const joursMarques = new Set(attendances.map(a => a.date));

  const statutColor = (s: string) =>
    s === 'PAYE' ? 'success' : s === 'EN_ATTENTE' ? 'warning' : 'secondary';

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="xl" backdrop="static">

      <ModalHeader toggle={toggle} className="border-0 pb-0 align-items-start">
        {emp && (
          <div className="d-flex align-items-center gap-3 flex-wrap">
            <div className="avatar-sm flex-shrink-0">
              <span className="avatar-title rounded-circle bg-primary-subtle text-primary fw-medium fs-16">
                {initiales}
              </span>
            </div>
            <div>
              <h5 className="mb-0">{emp.nom_complet}</h5>
              <small className="text-muted">
                {emp.departement} · {emp.site_travail} · ID Odoo #{emp.odoo_id}
              </small>
            </div>
            <Badge
              color={emp.statut === StatutEmploye.ACTIF ? 'success' : 'danger'}
              className="ms-1"
            >
              {emp.statut}
            </Badge>
          </div>
        )}
      </ModalHeader>

      {g && (
        <ModalBody className="pt-2">

          <Row className="g-3">
            {/* Colonne gauche : KPIs + contact */}
            <Col lg={4}>
              <Row className="g-2 mb-3">
                <Col xs={6}>
                  <div className="p-3 bg-warning-subtle rounded-2 text-center">
                    <p className="text-uppercase fw-medium text-muted fs-11 mb-1">Jours</p>
                    <h4 className="text-warning mb-0">{nbJours} j</h4>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-3 bg-success-subtle rounded-2 text-center">
                    <p className="text-uppercase fw-medium text-muted fs-11 mb-1">Montant dû</p>
                    <h4 className="text-success mb-0">{fmt(montantDu)}</h4>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-3 bg-light rounded-2 text-center">
                    <p className="text-uppercase fw-medium text-muted fs-11 mb-1">Heures travaillées</p>
                    <h5 className="mb-0">{totalHeures}h</h5>
                  </div>
                </Col>
                <Col xs={6}>
                  <div className="p-3 bg-light rounded-2 text-center">
                    <p className="text-uppercase fw-medium text-muted fs-11 mb-1">En attente</p>
                    <h5 className="mb-0">{enAttenteIds.length}</h5>
                  </div>
                </Col>
              </Row>

              {/* Bloc contact / paiement */}
              <div className="border rounded-2 p-3">
                <h6 className="text-uppercase fw-semibold text-muted fs-11 mb-3">Contact & paiement</h6>
                <ul className="list-unstyled mb-0 vstack gap-2">
                  <li className="d-flex align-items-center gap-2">
                    <i className="ri-phone-line text-muted" />
                    <span>{emp?.mobile_phone ?? '—'}</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <i className="ri-smartphone-line text-muted" />
                    <span>{emp?.operateur_mobile ?? '—'}</span>
                  </li>
                  <li className="d-flex align-items-center gap-2">
                    <i className="ri-bank-card-line text-muted" />
                    {emp?.notchpay_beneficiary_id ? (
                      <Badge color="success" className="bg-success-subtle text-success">
                        Bénéficiaire NotchPay lié
                      </Badge>
                    ) : (
                      <Badge color="danger" className="bg-danger-subtle text-danger">
                        Non lié NotchPay
                      </Badge>
                    )}
                  </li>
                </ul>
              </div>

              {/* Calendrier lecture seule */}
              <div className="mt-3">
                <div className="d-flex align-items-center justify-content-between mb-2">
                  <h6 className="text-uppercase fw-semibold text-muted fs-11 mb-0">Jours pointés</h6>
                  <small className="text-muted fst-italic">lecture seule</small>
                </div>
                <div className="upcoming-scheduled">
                  <Flatpickr
                    className="form-control"
                    options={{
                      dateFormat: 'd M, Y',
                      inline: true,
                      onDayCreate: (_d, _s, _fp, dayElem) => {
                        const d = dayElem.dateObj;
                        const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                        if (joursMarques.has(iso)) dayElem.classList.add('jour-cumule');
                      },
                    }}
                  />
                </div>
                <div className="d-flex align-items-center mt-2">
                  <span className="rounded-circle me-2 flex-shrink-0"
                    style={{ width: 8, height: 8, background: '#c9a227', display: 'inline-block' }} />
                  <small className="text-muted">Jour issu de l'historique d'attendance</small>
                </div>
              </div>
            </Col>

            {/* Colonne droite : détail des attendances */}
            <Col lg={8}>
              <div className="d-flex align-items-center justify-content-between mb-2">
                <h6 className="text-uppercase fw-semibold text-muted fs-11 mb-0">
                  Détail des pointages ({attendances.length})
                </h6>
              </div>

              <div className="table-responsive" style={{ maxHeight: 420, overflowY: 'auto' }}>
                <Table size="sm" className="table-hover align-middle mb-0">
                  <thead className="table-light" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th>Date</th>
                      <th>Action</th>
                      <th>Heures</th>
                      <th>Montant</th>
                      <th>Statut</th>
                      <th>Validé le</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendances.map(a => (
                      <tr key={a.id}>
                        <td>{new Date(a.date).toLocaleDateString('fr-FR')}</td>
                        <td className="text-muted">{a.action}</td>
                        <td>{a.worked_hours}h</td>
                        <td className="fw-medium">{fmt(parseFloat(a.montant_journalier))}</td>
                        <td>
                          <Badge className={`bg-${statutColor(a.statut_paiement)}-subtle text-${statutColor(a.statut_paiement)}`}>
                            {a.statut_paiement}
                          </Badge>
                        </td>
                        <td className="text-muted fs-13">
                          {a.date_validation_paiement
                            ? new Date(a.date_validation_paiement).toLocaleDateString('fr-FR')
                            : '—'}
                        </td>
                      </tr>
                    ))}
                    {attendances.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-3">Aucun pointage</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Col>
          </Row>

        </ModalBody>
      )}

      <ModalFooter className="border-0 pt-0">
        <Button color="light" onClick={toggle}>Fermer</Button>
        <button
          onClick={() => { if (g && onViewPortefeuille) onViewPortefeuille(g); }}
          className="btn btn-soft-primary d-flex align-items-center gap-1"
        >
          <i className="ri-eye-line" />Voir le portefeuille
        </button>
        {onConfirmerRH && g && enAttenteIds.length > 0 && (
          <Button color="success" onClick={() => { onConfirmerRH(enAttenteIds); toggle(); }}>
            <i className="ri-check-line align-middle me-1" />
            Confirmer RH ({enAttenteIds.length})
          </Button>
        )}
      </ModalFooter>

    </Modal>
  );
};

export default ModalDetailEmploye;