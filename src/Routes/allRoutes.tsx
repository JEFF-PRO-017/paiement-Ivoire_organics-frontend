import DetailPortefeuille from "pages/DetailPaeimentEnployes/Index";
import HistoriquePaiements from "pages/Historique/Index";
import DashboardPaiement from "pages/TableauBord/Index";
import Login from "pages/Authentication/Login";
import Logout from "pages/Authentication/Logout";
import NoSitePage from "pages/Errors/NoSitePage";
import { Navigate } from "react-router-dom";

const authProtectedRoutes = [
  { path: "/paiement",            component: <DashboardPaiement /> },
  { path: "/paiement/:id",        component: <DetailPortefeuille /> },
  { path: "/paiement/historique", component: <HistoriquePaiements /> },
  { path: "/",    exact: true,    component: <Navigate to="/paiement" /> },
  { path: "*",                    component: <Navigate to="/paiement" /> },
];

const publicRoutes = [
  // { path: "/logout",         component: <Logout /> },
  { path: "/login",          component: <Login /> },
  { path: "/error/no-site",  component: <NoSitePage /> },
];

export { authProtectedRoutes, publicRoutes };