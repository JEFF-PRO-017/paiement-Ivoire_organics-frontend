// OdooSection.tsx
import { useState } from 'react';
import { Card, CardBody, CardTitle, Button, Input, InputGroup, Spinner } from 'reactstrap';
import FeatherIcon from 'feather-icons-react';

interface Props {
  /** true pendant tout traitement Odoo en cours (employés ou présences) */
  loading: boolean;
  /** Relance le rechargement complet des employés depuis Odoo */
  onLoadEmployees: () => void;
  /** Relance la synchronisation des présences sur les N derniers jours */
  onLoadAttendances: (days: number) => void;
}

/**
 * Section d'administration de la synchronisation Odoo.
 * Deux actions indépendantes mais mutuellement bloquantes :
 * - rechargement complet des employés
 * - resynchronisation des présences sur une période donnée (en jours)
 * Les deux opérations peuvent être longues : l'UI reste verrouillée
 * (loading) jusqu'à leur fin pour éviter les déclenchements multiples.
 */
export const OdooSection = ({ loading, onLoadEmployees, onLoadAttendances }: Props) => {
  const [days, setDays] = useState(3);

  return (
    <Card className="mb-3">
      <CardBody>
        <CardTitle tag="h5">Synchronisation Odoo</CardTitle>

        <div className="d-flex align-items-center gap-2 mb-3">
          <Button
            color="primary"
            outline
            onClick={onLoadEmployees}
            disabled={loading}
            title="Recharge la liste complète des employés depuis Odoo. Opération potentiellement longue."
          >
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
            title="Nombre de jours en arrière à resynchroniser"
          />
          <Button
            color="primary"
            onClick={() => onLoadAttendances(days)}
            disabled={loading}
            title={`Relance la synchronisation des présences sur les ${days} derniers jours. Ne fermez pas la page pendant le traitement.`}
          >
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