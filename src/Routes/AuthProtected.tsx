import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "pages/Authentication/useAuth";

const AuthProtected = (props: any) => {
  const { user, loading } = useAuth();

  // if (loading) {
  //   return null; // ou un spinner
  // }

  if (!user) {
    return <Navigate to={{ pathname: "/login" }} />;
  }

  return <>{props.children}</>;
};

export default AuthProtected;