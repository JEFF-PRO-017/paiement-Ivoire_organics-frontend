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
  ];

  return <React.Fragment>{menuItems}</React.Fragment>;
};

export default Navdata;