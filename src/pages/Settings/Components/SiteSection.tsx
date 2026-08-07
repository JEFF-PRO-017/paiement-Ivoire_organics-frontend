// SiteSection.tsx
import FeatherIcon from 'feather-icons-react';
import { Card, CardBody, CardTitle, Button, Spinner } from 'reactstrap';

interface Props {
  sites: string[];
  activeSite: string | null;
  changing: boolean;
  onChange: (site: string) => void;
}

export const SiteSection = ({ sites, activeSite, changing, onChange }: Props) => (
  <Card className="mb-3">
    <CardBody>
      <CardTitle tag="h5">
        Site actif{' '}
        <FeatherIcon icon="alert-triangle" size={14} className="text-warning" title="Changer de site recharge toute la page." />
      </CardTitle>
      <div className="d-flex gap-2 flex-wrap">
        {sites.map(site => (
          <Button
            key={site}
            color={site === activeSite ? 'primary' : 'light'}
            outline={site !== activeSite}
            onClick={() => onChange(site)}
            disabled={changing || site === activeSite}
          >
            {site}
          </Button>
        ))}
      </div>
      {changing && (
        <div className="mt-2 text-muted small">
          <Spinner size="sm" className="me-2" /> Changement de site en cours...
        </div>
      )}
    </CardBody>
  </Card>
);