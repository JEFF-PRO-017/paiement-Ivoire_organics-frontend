// OdooSection.tsx
import { useState } from 'react';
import { Card, CardBody, CardTitle, Button, Input, InputGroup, Spinner } from 'reactstrap';
import FeatherIcon from 'feather-icons-react';

interface Props {
  loading: boolean;
  onLoadEmployees: () => void;
  onLoadAttendances: (days: number) => void;
}

export const OdooSection = ({ loading, onLoadEmployees, onLoadAttendances }: Props) => {
  const [days, setDays] = useState(3);

  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h5">Synchronisation Odoo</CardTitle>

        <div className="d-flex align-items-center gap-2 mb-3">
          <Button color="primary" outline onClick={onLoadEmployees} disabled={loading} title="Recharge la liste complète des employés depuis Odoo. Peut prendre du temps.">
            Recharger tous les employés
          </Button>
        </div>

        <InputGroup style={{ maxWidth: 320 }}>
          <Input
            type="number"
            min={1}
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            disabled={loading}
          />
          <Button color="primary" onClick={() => onLoadAttendances(days)} disabled={loading} title="Relance la synchronisation des présences depuis N jours. Opération longue, ne fermez pas la page.">
            Relancer depuis {days}j
          </Button>
        </InputGroup>

        {loading && (
          <div className="mt-3 text-muted small">
            <Spinner size="sm" className="me-2" />
            <FeatherIcon icon="alert-circle" size={14} className="text-warning me-1" />
            Traitement en cours, ne quittez pas cette page.
          </div>
        )}
      </CardBody>
    </Card>
  );
};