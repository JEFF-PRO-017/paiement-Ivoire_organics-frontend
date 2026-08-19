import DetailPortefeuille from "pages/DetailPaeimentEnployes/Index";
import HistoriquePaiements from "pages/Historique/Index";
import DashboardPaiement from "pages/TableauBord/Index";
import Login from "pages/Authentication/Login";
import NoSitePage from "pages/Errors/NoSitePage";
import { Navigate } from "react-router-dom";
import { SettingsAdminPage } from "pages/Settings/SettingsAdminPage";

const authProtectedRoutes = [
  { path: "/paiement", component: <DashboardPaiement /> },
  { path: "/paiement/:id", component: <DetailPortefeuille /> },
  { path: "/paiement/historique", component: <HistoriquePaiements /> },
  { path: "/settings/admin", component: <SettingsAdminPage /> },
  { path: "/", exact: true, component: <Navigate to="/paiement" /> },
  { path: "*", component: <Navigate to="/paiement" /> },
];

const publicRoutes = [
  { path: "/login", component: <Login /> },
  { path: "/error/no-site", component: <NoSitePage /> },
];

export { authProtectedRoutes, publicRoutes };