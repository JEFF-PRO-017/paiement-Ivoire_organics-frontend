import { api } from "api/api";


export interface AuthUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  auth: {
    sites: string[];
    accessToken: string;
    refreshToken: string;
    expirationTime: string;
  };
  setting: {
    id: number;
    zoom: boolean;
    mode: string;
    site: string;
    page_dashboard: Record<string, boolean>;
    page_detail: Record<string, boolean>;
    page_historique: Record<string, boolean>;
  };
}


export const authService = {

  async login(email: string, password: string): Promise<AuthUser> {
    const login = await api.post('api/auth/login/', { email, password })
    return login.data
  },

  async logout(): Promise<void> {
    return await api.post('api/auth/logout/')
  },
};