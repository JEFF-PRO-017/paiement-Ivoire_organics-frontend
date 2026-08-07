import React from 'react';
import FeatherIcon from 'feather-icons-react';

const Navdata = () => {
  const menuItems: any[] = [
    {
      label:    'Menu',
      isHeader: true,
    },
    {
      id:    'dashboard-default',
      label: 'Vue générale',
      icon:  <FeatherIcon icon="home" className="icon-dual" />,
      link:  '/paiement',
    },
    {
      id:    'dashboard-historique',
      label: 'Historique global',
      icon:  <FeatherIcon icon="clock" className="icon-dual" />,
      link:  '/paiement/historique',
    },
    {
      id:    'settings-admin',
      label: 'Paramètres administrateur',
      icon:  <FeatherIcon icon="settings" className="icon-dual" />,
      link:  '/settings/admin',
    }
  ];

  return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;