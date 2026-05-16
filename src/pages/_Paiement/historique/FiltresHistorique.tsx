/*
  FiltresHistorique.tsx
  Barre de filtres : date range, search, département, chips rapides, reset.
*/

import React from 'react';
import { Col, Row } from 'reactstrap';
import Flatpickr from 'react-flatpickr';
import { CHIPS, DEPTS } from './historique.constants';
import { FiltresState }  from './historique.types';

interface Props {
  filtres:        FiltresState;
  onSearch:       (v: string)    => void;
  onDept:         (v: string)    => void;
  onDateRange:    (v: Date[])    => void;
  onChip:         (c: string)    => void;
  onReset:        () => void;
}

const FiltresHistorique: React.FC<Props> = ({
  filtres, onSearch, onDept, onDateRange, onChip, onReset,
}) => (
  <div className="p-3 border-bottom">
    <Row className="g-2 align-items-end mb-2">

      {/* Plage de dates */}
      <Col sm={6} md={3}>
        <label className="form-label text-uppercase fw-medium text-muted fs-11 mb-1">
          Plage de dates
        </label>
        <Flatpickr
          className="form-control form-control-sm"
          placeholder="Début → Fin"
          value={filtres.dateRange}
          options={{ mode: 'range', dateFormat: 'd M, Y' }}
          onChange={onDateRange}
        />
      </Col>

      {/* Recherche employé */}
      <Col sm={6} md={3}>
        <label className="form-label text-uppercase fw-medium text-muted fs-11 mb-1">
          Employé
        </label>
        <div className="search-box">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Nom ou matricule…"
            value={filtres.search}
            onChange={e => onSearch(e.target.value)}
          />
          <i className="ri-search-line search-icon" />
        </div>
      </Col>

      {/* Département */}
      <Col sm={6} md={2}>
        <label className="form-label text-uppercase fw-medium text-muted fs-11 mb-1">
          Département
        </label>
        <select
          className="form-select form-select-sm"
          value={filtres.dept}
          onChange={e => onDept(e.target.value)}
        >
          {DEPTS.map(d => <option key={d}>{d}</option>)}
        </select>
      </Col>

      {/* Reset */}
      <Col sm="auto" className="d-flex gap-2">
        <button
          className="btn btn-soft-secondary btn-sm d-flex align-items-center gap-1"
          onClick={onReset}
        >
          <i className="ri-refresh-line" />Réinitialiser
        </button>
      </Col>
    </Row>

    {/* Chips période rapide */}
    <div className="d-flex align-items-center gap-2 flex-wrap">
      <span className="text-muted fs-12">Période rapide :</span>
      {CHIPS.map(c => (
        <button
          key={c}
          className={`btn btn-sm rounded-pill ${filtres.activeChip === c ? 'btn-primary' : 'btn-outline-secondary'}`}
          style={{ padding: '2px 12px', fontSize: 11 }}
          onClick={() => onChip(c)}
        >
          {c}
        </button>
      ))}
    </div>
  </div>
);

export default FiltresHistorique;