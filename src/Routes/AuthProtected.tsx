import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "pages/Authentication/useAuth";

const AuthProtected = (props: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  // if (loading) return null; // ou un spinner si tu en as un

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{props.children}</>;
};

export default AuthProtected;