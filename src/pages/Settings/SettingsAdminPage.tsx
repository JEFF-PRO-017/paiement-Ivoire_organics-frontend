// SettingsAdminPage.tsx
import { Container, Button } from 'reactstrap';
import { useSettingsAdmin } from './Hooks/useSettingsAdmin';
import { SoldeSection } from './Components/SoldeSection';
import { ModePaiementSection } from './Components/ModePaiementSection';
import { SiteSection } from './Components/SiteSection';
import { OdooSection } from './Components/OdooSection';
import { useAuth } from 'pages/Authentication/useAuth';
import React from 'react';

export const SettingsAdminPage = () => {
  const {logout } = useAuth();

  const {
    showSolde, solde, loadingSolde, toggleSolde,
    modeInfo, loadingMode, changeMode,
    sites, activeSite, changingSite, changeSite,
    odooLoading, loadEmployees, loadAttendances,
  } = useSettingsAdmin();

  return (
    <React.Fragment>
      <div className="page-content">
        <Container fluid>
          <h3 className="mb-4">Paramètres administrateur</h3>

          <fieldset disabled={odooLoading}>
            <SoldeSection solde={solde} visible={showSolde} loading={loadingSolde} onToggle={toggleSolde} />
            <ModePaiementSection info={modeInfo} loading={loadingMode} onChange={changeMode} />
            <SiteSection sites={sites} activeSite={activeSite} changing={changingSite} onChange={changeSite} />
            <OdooSection loading={odooLoading} onLoadEmployees={loadEmployees} onLoadAttendances={loadAttendances} />
          </fieldset>

          <Button color="danger" outline onClick={() => logout()} disabled={odooLoading}>
            Se déconnecter
          </Button>
        </Container>
      </div>
    </React.Fragment>
  );
};