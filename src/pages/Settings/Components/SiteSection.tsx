// SiteSection.tsx
import FeatherIcon from 'feather-icons-react';
import { Card, CardBody, CardTitle, Button, Spinner } from 'reactstrap';

interface Props {
  /** Liste des sites accessibles à l'utilisateur connecté */
  sites: string[];
  /** Site actuellement actif, ou null si aucun n'est encore défini */
  activeSite: string | null;
  /** true pendant le changement de site */
  changing: boolean;
  /** Déclenche le changement vers le site sélectionné */
  onChange: (site: string) => void;
}

/**
 * Permet de basculer entre les différents sites de l'utilisateur.
 * Le site actif est mis en évidence ; le bouton correspondant est
 * désactivé pour éviter un rechargement inutile sur le site déjà actif.
 */
export const SiteSection = ({ sites, activeSite, changing, onChange }: Props) => (
  <Card className="mb-3">
    <CardBody>
      <CardTitle tag="h5">
        Site actif{' '}
        <FeatherIcon
          icon="alert-triangle"
          size={14}
          className="text-warning"
          title="Changer de site recharge l'ensemble du tableau de bord."
        />
      </CardTitle>

      <div className="d-flex gap-2 flex-wrap">
        {sites.map(site => {
          const isActive = site === activeSite;
          return (
            <Button
              key={site}
              color={isActive ? 'primary' : 'light'}
              outline={!isActive}
              onClick={() => onChange(site)}
              disabled={changing || isActive}
              title={isActive ? 'Site actuellement actif' : `Basculer sur le site ${site}`}
            >
              {site}
            </Button>
          );
        })}
      </div>

      {changing && (
        <div className="mt-2 text-muted small">
          <Spinner size="sm" className="me-2" />
          Changement de site en cours...
        </div>
      )}
    </CardBody>
  </Card>
);