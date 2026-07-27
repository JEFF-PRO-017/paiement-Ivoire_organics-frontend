// AuthContext.tsx
import React, { createContext, useContext, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "./authService";
import { getUser, getAuthTokens, setUser, clearAuth, AuthUser } from "./utilis";


interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  token: () => string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: (reason?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [user, setUserState] = useState<AuthUser | null>(() => getUser<AuthUser>());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const token = (): string | null => getAuthTokens()?.accessToken ?? null;

  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const u = await authService.login(email, password);
      setUser(u);
      setUserState(u);
      navigate("/dashboard");
    } catch (e: any) {
      const message = e?.message ?? "Erreur de connexion";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async (reason?: string) => {
    setLoading(true);
    try {
      await authService.logout();
    } catch (e) {
      console.log(e);
    } finally {
      clearAuth();
      setUserState(null);
      setLoading(false); // corrigé : était setLoading(true)
      if (reason) toast.info(reason);
      navigate("/login");
    }
  };
  return React.createElement(AuthContext.Provider, { value: { user, loading, error, token, login, logout } }, children,);

};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un <AuthProvider>");
  }
  return context;
};