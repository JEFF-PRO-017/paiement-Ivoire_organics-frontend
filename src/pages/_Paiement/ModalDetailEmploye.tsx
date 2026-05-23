import React from 'react';
import Flatpickr from 'react-flatpickr';
import {
  Modal, ModalHeader, ModalBody, ModalFooter,
  Button, Badge, Row, Col,
} from 'reactstrap';
import { Portefeuille, StatutEmploye } from './types';
import { Link } from 'react-router-dom';

interface Props {
  portefeuille: Portefeuille | null;
  isOpen: boolean;
  toggle: () => void;
  onViewPortefeuille?: (row: Portefeuille) => void;
  onConfirmerRH?: (id: number) => void;
}

const ModalDetailEmploye: React.FC<Props> = ({ portefeuille, isOpen, toggle, onViewPortefeuille, onConfirmerRH }) => {
  const p = portefeuille;
  const emp = p?.employe;

  const initiales = emp?.nom_complet.split(' ').map(n => n[0]).slice(0, 2).join('') ?? '';
  const montantDu = p ? p.nombre_jours_impayes * p.montant_journalier : 0;
  const fmt = (n: number) => n.toLocaleString('fr-FR') + ' F';

  return (
    <Modal isOpen={isOpen} toggle={toggle} centered size="md" backdrop="static">

      <ModalHeader toggle={toggle} className="border-0 pb-0 align-items-start">
        {emp && (
          <div className="d-flex align-items-center gap-3">
            {/* Avatar initiales — pattern Velzon */}
            <div className="avatar-sm flex-shrink-0">
              <span className="avatar-title rounded-circle bg-primary-subtle text-primary fw-medium fs-16">
                {initiales}
              </span>
            </div>
            <div>
              <h5 className="mb-0">{emp.nom_complet}</h5>
              <small className="text-muted">{emp.departement} · {emp.site_travail}</small>
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

      {p && (
        <ModalBody className="pt-2">

          {/* KPIs 2×2 — bg-*-subtle  */}
          <Row className="g-2 mb-4">
            <Col xs={6}>
              <div className="p-3 bg-warning-subtle rounded-2 text-center">
                <p className="text-uppercase fw-medium text-muted fs-11 mb-1">Jours impayés</p>
                <h4 className="text-warning mb-0">{p.nombre_jours_impayes} j</h4>
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
                <p className="text-uppercase fw-medium text-muted fs-11 mb-1">Taux journalier</p>
                <h5 className="mb-0">{fmt(p.montant_journalier)}</h5>
              </div>
            </Col>
            <Col xs={6}>
              <div className="p-3 bg-light rounded-2 text-center d-flex flex-column align-items-center justify-content-center">
                <p className="text-uppercase fw-medium text-muted fs-11 mb-2">Statut</p>
                <Badge color="warning">{p.statut}</Badge>
              </div>
            </Col>
          </Row>

          {/* Calendrier périodes_paiement — lecture seule */}
          <div className="d-flex align-items-center justify-content-between mb-2">
            <h6 className="text-uppercase fw-semibold text-muted mb-0">
              Périodes de paiement
            </h6>
            <small className="text-muted fst-italic">lecture seule</small>
          </div>

          <div className="upcoming-scheduled">
            <Flatpickr
              className="form-control"
              options={{
                dateFormat: 'd M, Y',
                inline: true,
                onDayCreate: (_d, _s, _fp, dayElem) => {
                  const iso = dayElem.dateObj.toISOString().split('T')[0];
                  if ((p.periodes_paiement ?? []).includes(iso)) {
                    dayElem.classList.add('jour-cumule');
                  }
                },
              }}
            />
          </div>

          <div className="d-flex align-items-center mt-2">
            <span className="rounded-circle me-2 flex-shrink-0"
              style={{ width: 8, height: 8, background: '#c9a227', display: 'inline-block' }} />
            <small className="text-muted">Jour enregistré dans periodes_paiement</small>
          </div>

        </ModalBody>
      )}

      <ModalFooter className="border-0 pt-0">
        <Button color="light" onClick={toggle}>Fermer</Button>
        <button
          onClick={() => { if (p && onViewPortefeuille) onViewPortefeuille(p); }}
          className="btn btn-soft-primary d-flex align-items-center gap-1"
        >
          <i className="ri-eye-line" />Voir le portefeuille
        </button>
        {onConfirmerRH && p && (
          <Button color="success" onClick={() => { onConfirmerRH(p.id); toggle(); }}>
            <i className="ri-check-line align-middle me-1" />
            Confirmer RH
          </Button>
        )}
      </ModalFooter>

    </Modal>
  );
};

export default ModalDetailEmploye;