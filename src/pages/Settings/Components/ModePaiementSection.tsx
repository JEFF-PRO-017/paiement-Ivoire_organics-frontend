// ModePaiementSection.tsx
import { Card, CardBody, CardTitle, Badge, FormGroup, Input, Label, Spinner, Row, Col } from 'reactstrap';
import { ModePaiementInfo, ModePaiementType } from '../types';
import FeatherIcon from 'feather-icons-react';

interface Props {
  info: ModePaiementInfo | null;
  loading: boolean;
  onChange: (mode: ModePaiementType) => void;
}

export const ModePaiementSection = ({ info, loading, onChange }: Props) => (
  <Card className="mb-3">
    <CardBody>
      <CardTitle tag="h5" className="d-flex justify-content-between align-items-center">
        <span>
          Mode de paiement{' '}
          <FeatherIcon icon="help-circle" size={14} title="Automatique = paiement déclenché tout seul selon le calendrier. Manuel = vous déclenchez vous-même chaque paiement." />
        </span>
        {info && <Badge color={info.mode === 'AUTOMATIQUE' ? 'success' : 'secondary'}>{info.mode}</Badge>}
      </CardTitle>

      {loading || !info ? (
        <Spinner size="sm" />
      ) : (
        <>
          <FormGroup tag="fieldset" className="mb-3">
            <FormGroup check inline>
              <Input
                type="radio"
                name="mode-paiement"
                checked={info.mode === 'AUTOMATIQUE'}
                onChange={() => onChange('AUTOMATIQUE')}
                disabled={loading}
              />
              <Label check>Automatique</Label>
            </FormGroup>
            <FormGroup check inline>
              <Input
                type="radio"
                name="mode-paiement"
                checked={info.mode === 'MANUEL'}
                onChange={() => onChange('MANUEL')}
                disabled={loading}
              />
              <Label check>Manuel</Label>
            </FormGroup>
          </FormGroup>

          <Row className="text-muted small">
            <Col md={4}>Changé le : {new Date(info.date_changement_mode).toLocaleString('fr-FR')}</Col>
            {info.derniere_execution_auto && (
              <Col md={4}>Dernière exécution : {new Date(info.derniere_execution_auto).toLocaleString('fr-FR')}</Col>
            )}
            {info.jours_restants !== null && (
              <Col md={4}>Jours restants : {info.jours_restants}</Col>
            )}
          </Row>
        </>
      )}
    </CardBody>
  </Card>
);