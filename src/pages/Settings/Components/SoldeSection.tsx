// SoldeSection.tsx
import { Card, CardBody, CardTitle, Button, Spinner } from 'reactstrap';
import FeatherIcon from 'feather-icons-react';

interface Props {
  solde: number | null;
  visible: boolean;
  loading: boolean;
  onToggle: () => void;
}

export const SoldeSection = ({ solde, visible, loading, onToggle }: Props) => (
  <Card className="mb-3">
    <CardBody className="d-flex justify-content-between align-items-center">
      <div>
        <CardTitle tag="h5">Solde NotchPay</CardTitle>
        <h3 className="mb-0">
          {loading ? <Spinner size="sm" /> : visible ? `${solde?.toLocaleString('fr-FR')} FCFA` : '••••••'}
        </h3>
      </div>
      <Button color="light" outline onClick={onToggle} disabled={loading} title={visible ? 'Masquer le solde' : 'Afficher le solde'}>
        <FeatherIcon icon={visible ? 'eye-off' : 'eye'} size={18} />
      </Button>
    </CardBody>
  </Card>
);