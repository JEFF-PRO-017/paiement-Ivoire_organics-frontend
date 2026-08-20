// SoldeSection.tsx
import { Card, CardBody, CardTitle, Button, Spinner } from 'reactstrap';
import FeatherIcon from 'feather-icons-react';
import { SoldeData } from '../types';

interface Props {
  /** Données de solde par pays/devise, ou null tant qu'elles n'ont pas encore été chargées */
  solde: SoldeData | null;
  /** true si les montants sont actuellement affichés en clair */
  visible: boolean;
  /** true pendant le chargement initial du solde */
  loading: boolean;
  /** Bascule l'affichage/masquage du solde (charge la donnée au premier appel) */
  onToggle: () => void;
}

/**
 * Affiche le solde NotchPay par pays/devise.
 * Le solde est masqué par défaut (••••••) pour éviter l'affichage
 * accidentel d'informations sensibles ; il n'est chargé depuis l'API
 * qu'au premier clic sur "Afficher".
 */
export const SoldeSection = ({ solde, visible, loading, onToggle }: Props) => (
  <Card className="mb-3">
    <CardBody>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <CardTitle tag="h5" className="mb-0">
          Solde NotchPay
        </CardTitle>

        <Button
          color="light"
          outline
          onClick={onToggle}
          disabled={loading}
          title={
            visible
              ? 'Masquer le solde à l\'écran'
              : 'Afficher le solde (première consultation : chargement depuis NotchPay)'
          }
        >
          <FeatherIcon icon={visible ? 'eye-off' : 'eye'} size={18} />
        </Button>
      </div>

      {loading ? (
        <Spinner size="sm" />
      ) : (
        <div className="d-flex flex-wrap gap-3">
          {solde?.solde.map((item, index) => (
            <div key={`${item.country}-${item.currency}-${index}`} className="text-center">
              <div className="text-muted small">
                {item.country} {item.currency}
              </div>
              <div className="fw-bold">
                {visible
                  ? `${parseFloat(item.balance).toLocaleString('fr-FR')} ${item.currency}`
                  : '••••••'}
              </div>
            </div>
          ))}
        </div>
      )}
    </CardBody>
  </Card>
);