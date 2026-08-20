// ModePaiementSection.tsx
import { Card, CardBody, CardTitle, Badge, FormGroup, Input, Label, Spinner, Row, Col } from 'reactstrap';
import { ModePaiementInfo, ModePaiementType } from '../types';
import FeatherIcon from 'feather-icons-react';

interface Props {
  /** Configuration actuelle du mode de paiement, ou null tant qu'elle n'est pas chargée */
  info: ModePaiementInfo | null;
  /** true pendant le chargement initial ou un changement de mode */
  loading: boolean;
  /** Change le mode de paiement (AUTOMATIQUE ou MANUEL) */
  onChange: (mode: ModePaiementType) => void;
}

/**
 * Gère le mode de déclenchement des paiements :
 * - AUTOMATIQUE : les paiements sont déclenchés par le scheduler,
 *   selon la périodicité configurée côté backend.
 * - MANUEL : chaque paiement doit être déclenché explicitement
 *   par un administrateur.
 * Affiche également l'historique (date du dernier changement,
 * dernière exécution auto, jours restants avant la prochaine échéance).
 */
export const ModePaiementSection = ({ info, loading, onChange }: Props) => (
  <Card className="mb-3">
    <CardBody>
      <CardTitle tag="h5" className="d-flex justify-content-between align-items-center">
        <span>
          Mode de paiement{' '}
          <FeatherIcon
            icon="help-circle"
            size={14}
            title="Automatique : paiement déclenché tout seul selon le calendrier configuré. Manuel : vous déclenchez vous-même chaque paiement."
          />
        </span>
        {info && (
          <Badge
            color={info.mode === 'AUTOMATIQUE' ? 'success' : 'secondary'}
            title={`Mode actuellement actif : ${info.mode}`}
          >
            {info.mode}
          </Badge>
        )}
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
              <Label check title="Les paiements se déclenchent automatiquement selon le calendrier configuré">
                Automatique
              </Label>
            </FormGroup>

            <FormGroup check inline>
              <Input
                type="radio"
                name="mode-paiement"
                checked={info.mode === 'MANUEL'}
                onChange={() => onChange('MANUEL')}
                disabled={loading}
              />
              <Label check title="Chaque paiement doit être déclenché manuellement par un administrateur">
                Manuel
              </Label>
            </FormGroup>
          </FormGroup>

          <Row className="text-muted small">
            <Col md={4} title="Date à laquelle le mode actuel a été activé">
              Changé le : {new Date(info.date_changement_mode).toLocaleString('fr-FR')}
            </Col>

            {info.derniere_execution_auto && (
              <Col md={4} title="Dernière fois que le paiement automatique s'est exécuté">
                Dernière exécution : {new Date(info.derniere_execution_auto).toLocaleString('fr-FR')}
              </Col>
            )}

            {info.jours_restants !== null && (
              <Col md={4} title="Nombre de jours avant la prochaine exécution automatique">
                Jours restants : {info.jours_restants}
              </Col>
            )}
          </Row>
        </>
      )}
    </CardBody>
  </Card>
);