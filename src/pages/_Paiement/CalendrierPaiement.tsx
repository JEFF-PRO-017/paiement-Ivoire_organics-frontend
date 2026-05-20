import React from 'react';
import Flatpickr from 'react-flatpickr';
import { HistoriquePaiement } from './types';
import { fmtDate, fmt } from '../Utils/Utils';

interface Props {
  joursCumules: string[];
  historique: HistoriquePaiement[];
}

const CalendrierPaiement: React.FC<Props> = ({ joursCumules, historique }) => {

  return (
    <React.Fragment>
        <div className=" w-100 card card-height-100">

          <div className="card-header border-0 align-items-center d-flex">
            <h4 className="card-title flex-grow-1 mb-0">
              <i className="ri-calendar-event-line align-middle me-1 text-warning" />
              Jours impayés cumulés
            </h4>
            {/* <span className="badge bg-warning-subtle text-warning fs-11">Flatpickr</span> */}
          </div>

          <div className="card-body pt-0">
            {/* Calendrier inline — jours en or via .jour-cumule (dashboard.scss) */}
            <div className="upcoming-scheduled">
              <Flatpickr
                className="form-control"
                options={{
                  dateFormat: 'd M, Y',
                  inline: true,
                  onDayCreate: (_d, _s, _fp, dayElem) => {
                    const iso = dayElem.dateObj.toISOString().split('T')[0];
                    if (joursCumules.includes(iso)) dayElem.classList.add('jour-cumule');
                  },
                }}
              />
            </div>

            {/* Légende */}
            <div className="d-flex align-items-center mt-2 mb-4">
              <span className="rounded-circle me-2 flex-shrink-0"
                style={{ width: 8, height: 8, background: '#c9a227', display: 'inline-block' }} />
              <small className="text-muted">Jour impayé cumulé</small>
            </div>

            {/* 3 derniers paiements — pattern mini-stats-wid  */}
            <h6 className="text-uppercase fw-semibold text-muted mb-3">Derniers paiements</h6>

            {historique?.map(item => (
              <div key={item.id} className="mini-stats-wid d-flex align-items-center mt-3">
                <div className="flex-shrink-0 avatar-sm">
                  <span className="mini-stat-icon avatar-title rounded-circle bg-success-subtle text-success fs-4">
                    {new Date(item.date_paiement).getDate()}
                  </span>
                </div>
                <div className="flex-grow-1 ms-3">
                  <h6 className="mb-1">{fmtDate(item.date_paiement)}</h6>
                  <p className="text-muted mb-0 fs-13">Paiement de {item.count} employé(s) effectué</p>
                </div>
                <div className="flex-shrink-0">
                  <span className="badge bg-success-subtle text-success fw-medium">
                    {fmt(item.total)}
                  </span>
                </div>
              </div>
            ))}

          </div>
        </div>
    </React.Fragment>
  );
};

export default CalendrierPaiement;