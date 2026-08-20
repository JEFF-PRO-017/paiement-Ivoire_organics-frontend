import React from 'react';
import { Card, CardBody, Badge } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import { EmployeAttendanceGroup, StatutEmploye } from '../../Utils/types';
import { fmt } from 'pages/Utils/Utils';

interface Props {
  group: EmployeAttendanceGroup;
  loading: boolean;
  enAttenteCount: number;
  impayeCount: number;
  montantEnAttente: number;
  montantImpaye: number;
  onConfirmerRH: () => void;
  onMarquerPaye: () => void;
}

const EmployeSidebar: React.FC<Props> = ({
  group, loading,
  enAttenteCount, impayeCount, montantEnAttente, montantImpaye,
  onConfirmerRH, onMarquerPaye,
}) => {
  const { employe } = group;

  const initiales = employe.nom_complet
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  return (
    <>
      <Card className="card-h-100">
        <CardBody>

          {/* ── Avatar + infos employé ── */}
          <div className="text-center mb-3">
            <div className="avatar-lg mx-auto mb-2">
              <span className="avatar-title rounded-circle bg-primary-subtle text-primary fw-bold fs-3">
                {initiales}
              </span>
            </div>
            <h5 className="mb-1">{employe.nom_complet}</h5>
            <p className="text-muted fs-13 mb-2">
              {employe.departement} · {employe.site_travail}
            </p>
            <p className="text-muted fs-12 mb-2">ID Odoo #{employe.odoo_id}</p>
            <Badge
              className={`bg-${employe.statut === StatutEmploye.ACTIF ? 'success' : 'danger'}-subtle text-${employe.statut === StatutEmploye.ACTIF ? 'success' : 'danger'}`}
            >
              {employe.statut}
            </Badge>
          </div>

          {/* ── Contact & paiement ── */}
          <div className="border rounded-2 p-3 mb-3">
            <h6 className="text-uppercase fw-semibold text-muted fs-11 mb-2">Contact & paiement</h6>
            <ul className="list-unstyled mb-0 vstack gap-2">
              <li className="d-flex align-items-center gap-2">
                <i className="ri-phone-line text-muted" />
                <span className="fs-13">{employe.mobile_phone ?? '—'}</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="ri-smartphone-line text-muted" />
                <span className="fs-13">{employe.operateur_mobile ?? '—'}</span>
              </li>
              <li className="d-flex align-items-center gap-2">
                <i className="ri-bank-card-line text-muted" />
                {employe.notchpay_beneficiary_id ? (
                  <Badge className="bg-success-subtle text-success">Bénéficiaire NotchPay lié</Badge>
                ) : (
                  <Badge className="bg-danger-subtle text-danger">Non lié NotchPay</Badge>
                )}
              </li>
            </ul>
          </div>

          {/* ── KPIs : plus de statut unique, on montre les deux groupes ── */}
          <div className="mb-1">
            <div className="d-flex align-items-center p-2 rounded-2 bg-warning-subtle mb-2">
              <i className="ri-calendar-todo-line text-warning fs-18 me-2" />
              <div className="flex-grow-1">
                <p className="text-uppercase fw-medium text-warning fs-10 mb-0">En attente RH</p>
                <h6 className="text-warning mb-0">{enAttenteCount} j · {fmt(montantEnAttente)}</h6>
              </div>
            </div>
            <div className="d-flex align-items-center p-2 rounded-2 bg-danger-subtle mb-2">
              <i className="ri-money-dollar-circle-line text-danger fs-18 me-2" />
              <div className="flex-grow-1">
                <p className="text-uppercase fw-medium text-danger fs-10 mb-0">Impayés</p>
                <h6 className="text-danger mb-0">{impayeCount} j · {fmt(montantImpaye)}</h6>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="py-2 p-3">
        <h5 className="mb-1">Actions disponibles</h5>
        <p className="text-muted fs-12 mb-2">Traitez en une fois toutes les présences concernées</p>

        <SimpleBar style={{ height: '260px' }} className="pe-1 me-n1 mb-3">
          <Card className="mb-3">
            <CardBody className="vstack gap-2">
              <button
                className="btn btn-ghost-success d-flex align-items-center justify-content-between gap-2 p-2 rounded-2 w-100 text-start"
                onClick={onConfirmerRH}
                disabled={loading || enAttenteCount === 0}
              >
                <span className="d-flex align-items-center gap-2">
                  <i className="ri-check-double-line text-success fs-16" />
                  <span className="fs-13 fw-medium">Confirmer RH</span>
                </span>
                {enAttenteCount > 0 && <Badge className="bg-success-subtle text-success">{enAttenteCount}</Badge>}
              </button>

              <button
                className="btn btn-ghost-primary d-flex align-items-center justify-content-between gap-2 p-2 rounded-2 w-100 text-start"
                onClick={onMarquerPaye}
                disabled={loading || impayeCount === 0}
              >
                <span className="d-flex align-items-center gap-2">
                  <i className="ri-bank-card-2-line text-primary fs-16" />
                  <span className="fs-13 fw-medium">Marquer comme payé</span>
                </span>
                {impayeCount > 0 && <Badge className="bg-primary-subtle text-primary">{impayeCount}</Badge>}
              </button>
            </CardBody>
          </Card>
        </SimpleBar>
      </div>
    </>
  );
};

export default EmployeSidebar;