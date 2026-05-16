import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardBody, Badge } from 'reactstrap';
import SimpleBar from 'simplebar-react';
import { Portefeuille, StatutPortefeuille, StatutEmploye } from '../types';
import { STATUT_CLR, STATUT_ORDER, fmt, fmtDate } from './constants';

interface Props {
  pf: Portefeuille;
  loading: boolean;
  onOuvrirEmpreinte: (action: 'confirmer_rh' | 'marquer_paye') => void;
  onReset: () => void;
}

const EmployeSidebar: React.FC<Props> = ({ pf, loading, onOuvrirEmpreinte, onReset }) => {
  const { employe } = pf;

  // Initiales avatar (ex: "Jean Dupont" → "JD")
  const initiales = employe!.nom_complet
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('');

  const montantDu = pf.nombre_jours_impayes * pf.montant_journalier;
  const statutIndex = STATUT_ORDER.indexOf(pf.statut);

  /*
    Étapes de la timeline de progression.
    TODO: quand l'API retourne des timestamps précis par étape
    (confirme_le, paye_le, etc.), remplacer les fallbacks fmtDate(pf.modifie_le).
  */
  const ETAPES = [
    { label: 'Portefeuille créé', date: fmtDate(pf.cree_le) },
    { label: 'Jours cumulés enregistrés', date: fmtDate(pf.modifie_le) },
    { label: 'En attente confirmation RH', date: pf.statut === StatutPortefeuille.EN_ATTENTE ? 'En cours' : fmtDate(pf.modifie_le) },
    { label: 'Confirmé RH', date: pf.statut === StatutPortefeuille.CONFIRME_RH || pf.statut === StatutPortefeuille.PAYE ? fmtDate(pf.modifie_le) : 'En attente' },
    { label: 'Paiement effectué', date: pf.statut === StatutPortefeuille.PAYE ? fmtDate(pf.modifie_le) : 'En attente' },
  ];

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
            <h5 className="mb-1">{employe!.nom_complet}</h5>
            <p className="text-muted fs-13 mb-2">
              {employe!.departement} · {employe!.site_travail}
            </p>
            <p className="text-muted fs-12 mb-2">{employe!.odoo_id}</p>
            <div className="d-flex gap-2 justify-content-center flex-wrap">
              <Badge
                color={employe!.statut === StatutEmploye.ACTIF ? 'success' : 'danger'}
                className={`bg-${employe!.statut === StatutEmploye.ACTIF ? 'success' : 'danger'}-subtle text-${employe!.statut === StatutEmploye.ACTIF ? 'success' : 'danger'}`}
              >
                {employe!.statut}
              </Badge>
              <Badge
                color={STATUT_CLR[pf.statut]}
                className={`bg-${STATUT_CLR[pf.statut]}-subtle text-${STATUT_CLR[pf.statut]}`}
              >
                {pf.statut}
              </Badge>
            </div>
          </div>

          <div>
            <p className="text-muted">Information de l'employé, nombre de jours impayés et leur valeur</p>
          </div>

          {/* ── KPIs compacts ── */}
          <div className="mb-3">
            {[
              { label: 'Jours impayés', val: `${pf.nombre_jours_impayes} j`, bg: 'warning', icon: 'ri-calendar-todo-line' },
              { label: 'Montant dû', val: fmt(montantDu), bg: 'success', icon: 'ri-money-dollar-circle-line' },
              { label: 'Taux/jour', val: fmt(pf.montant_journalier), bg: 'primary', icon: 'ri-price-tag-3-line' },
            ].map((k) => (
              <div key={k.label} className={`d-flex align-items-center p-2 rounded-2 bg-${k.bg}-subtle mb-2`}>
                <i className={`${k.icon} text-${k.bg} fs-18 me-2`} />
                <div className="flex-grow-1">
                  <p className={`text-uppercase fw-medium text-${k.bg} fs-10 mb-0`}>{k.label}</p>
                  <h6 className={`text-${k.bg} mb-0`}>{k.val}</h6>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <div className="py-2 p-3">
        <h5 className='mb-1'>Actions disponibles</h5>
        <p className="text-muted fs-12 mb-2">Gérez les actions disponibles pour ce portefeuille</p>
        <SimpleBar style={{ height: "300px" }} className="pe-1 me-n1 mb-3">
          <div id="upcoming-event-list">
            <Card className="mb-3">
              <CardBody>
                {pf.statut === StatutPortefeuille.EN_ATTENTE && (
                  <button
                    className="btn btn-ghost-success d-flex align-items-center gap-2 p-2 rounded-2 w-100 text-start"
                    onClick={() => onOuvrirEmpreinte('confirmer_rh')}
                    disabled={loading}
                  >
                    <i className="ri-fingerprint-line text-success fs-16" />
                    <span className="fs-13 fw-medium">Confirmer RH</span>
                  </button>
                )}

                {pf.statut === StatutPortefeuille.CONFIRME_RH && (
                  <button
                    className="btn btn-ghost-primary d-flex align-items-center gap-2 p-2 rounded-2 w-100 text-start"
                    onClick={() => onOuvrirEmpreinte('marquer_paye')}
                    disabled={loading}
                  >
                    <i className="ri-fingerprint-line text-primary fs-16" />
                    <span className="fs-13 fw-medium">Marquer comme payé</span>
                  </button>
                )}
              </CardBody>
            </Card>

            <Card className="mb-3">
              <CardBody>
                <div className="acitivity-timeline acitivity-main">
                  {ETAPES.map((e, i) => {
                    const done = i < statutIndex + 2;
                    const active = i === statutIndex + 1;
                    const pending = !done && !active;
                    return (
                      <div key={i} className="acitivity-item d-flex pb-3">
                        <div className="flex-shrink-0 avatar-xs acitivity-avatar me-3">
                          <div className={`avatar-title rounded-circle fs-14 ${active ? 'bg-primary text-white' :
                            done ? 'bg-success-subtle text-success' :
                              'bg-light text-muted'
                            }`}>
                            <i className={active ? 'ri-time-line' : done ? 'ri-check-line' : 'ri-more-fill'} />
                          </div>
                        </div>
                        <div className="flex-grow-1 ms-1" style={{ opacity: pending ? 0.45 : 1 }}>
                          <h6 className="mb-1 fs-12">{e.label}</h6>
                          <p className="text-muted mb-0 fs-11">{e.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardBody>
            </Card>
            <CardBody className="bg-info-subtle mt-3">
              <div className="py-2 p-3 rounded-2 ">
                <h6 className="text-muted fs-15 fw-medium mb-2">Légende du calendrier</h6>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-warning-subtle text-warning fs-11 px-2">●</span>
                    <small className="text-muted">Jour travaillé (non payé)</small>
                  </div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="badge bg-success-subtle text-success fs-11 px-2">●</span>
                    <small className="text-muted">Période payée</small>
                  </div>
                </div>
              </div>
            </CardBody>
          </div>
        </SimpleBar>
      </div>

    </>
  );
};

export default EmployeSidebar;