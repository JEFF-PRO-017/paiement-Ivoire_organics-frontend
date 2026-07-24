import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService, AuthUser } from "./authService";

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  token: () => string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: (reason?: string) => void;
  setToken: (newToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setToken = (newToken: string) => {
    localStorage.setItem("token", newToken);
  };

  const token = (): string | null => {
    return localStorage.getItem("token");
  };

  const user = (): AuthUser | null => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      return null;
    }
    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      return null;
    }
  };


  const login = async (
    email: string,
    password: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const u = await authService.login(email, password);
      console.log('user auth', u)
      localStorage.setItem("user", JSON.stringify(u));
      setToken(u.auth.accessToken);
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
    debugger
    try {
      setLoading(true)
      await authService.logout();
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      if (reason) {
        toast.info(reason);
      }
      navigate("/login");
    } catch (error) {
      console.log(error)
    } finally {
      setLoading(true)
    }
  };


  return React.createElement(AuthContext.Provider, { value: { user: user(), loading, error, token, login, logout, setToken } }, children,);
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé à l'intérieur d'un <AuthProvider>"
    );
  }

  return context;
};