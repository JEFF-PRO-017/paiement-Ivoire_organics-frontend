import { Card, CardBody, Button, Spinner } from 'reactstrap';

interface Props {
  loading: boolean;
  onVerifier: () => void;
}

export const VerificationPaiementsSection = ({ loading, onVerifier }: Props) => (
  <Card className="mb-3">
    <CardBody>
      <div className="d-flex align-items-center gap-2 flex-grow-1 mb-3">
        <div className="rounded-1" style={{ width: 4, height: 20, background: 'var(--vz-info)' }} />
        <h4 className="card-title mb-0">Vérification des paiements</h4>
        <i
          className="ri-question-line text-muted fs-16"
          style={{ cursor: 'help' }}
          title="Interroge pawapay pour connaître le statut réel de chaque paiement marqué 'ENCOURS', et met à jour leur statut en base (SUCCESS ou FAILED). Utile si le vérificateur automatique (scheduler) est en retard ou pour forcer une vérification immédiate."
        />
      </div>

      <Button
        color="primary"
        outline
        onClick={onVerifier}
        disabled={loading}
        title="Vérifie immédiatement le statut de tous les paiements en cours auprès de pawapay"
      >
        {loading ? (
          <>
            <Spinner size="sm" className="me-2" />
            Vérification en cours...
          </>
        ) : (
          'Vérifier les paiements en cours'
        )}
      </Button>
    </CardBody>
  </Card>
);