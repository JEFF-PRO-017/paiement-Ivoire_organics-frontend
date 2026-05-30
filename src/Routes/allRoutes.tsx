import DetailPortefeuille from "pages/DetailPaeimentEnployes/Index";
import HistoriquePaiements from "pages/Historique/Index";
import DashboardPaiement from "pages/TableauBord/Index";
import Login from "pages/Authentication/Login";
import Logout from "pages/Authentication/Logout";
import { Navigate } from "react-router-dom";

//Dashboard

const authProtectedRoutes = [

  { path: "/paiement", component: <DashboardPaiement /> },
  { path: "/paiement/:id", component: <DetailPortefeuille /> },
  { path: "/paiement/historique", component: <HistoriquePaiements /> },
  // this route should be at the end of all other routes
  // eslint-disable-next-line react/display-name
  {
    path: "/",
    exact: true,
    component: <Navigate to="/paiement" />,
  },
  { path: "*", component: <Navigate to="/paiement" /> },
  //Job pages
];

const publicRoutes = [
  // Authentication Page
  { path: "/logout", component: <Logout /> },
  { path: "/login", component: <Login /> },
];

export { authProtectedRoutes, publicRoutes };