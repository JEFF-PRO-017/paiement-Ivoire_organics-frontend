import { api, rawApi } from "api/api";
import { setAuthTokens, clearAuth, AuthUser, AuthTokens } from "./utilis";


export const authService = {
  async login(email: string, password: string): Promise<AuthUser> {
    const res = await api.post('api/auth/login/', { email, password });
    const { auth, ...user } = res.data; // adapte si ta structure diffère
    setAuthTokens(auth);
    console.log('auth',auth)
    return user as AuthUser;
  },

  async logout(): Promise<void> {
    await api.post('api/auth/logout/');
    clearAuth();
  },

  async refresh(refreshToken: string): Promise<Pick<AuthTokens, "accessToken" | "expirationTime">> {
    const res = await rawApi.post('api/auth/refresh/', { refreshToken });
    return res.data; // adapte si la forme d'ApiResponse diffère
  },
};