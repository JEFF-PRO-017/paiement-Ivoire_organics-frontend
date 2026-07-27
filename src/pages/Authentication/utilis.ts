import { authService } from "./authService";

// auth.ts
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expirationTime: string;
}

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


interface JwtPayload {
  exp: number;
  iat: number;
  [key: string]: unknown;
}

const AUTH_KEY = 'auth';
const USER_KEY = 'user';
let refreshPromise: Promise<string> | null = null;


export const getAuthTokens = (): AuthTokens | null => {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthTokens;
  } catch {
    return null;
  }
};

export const setAuthTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(tokens));
};

export const getUser = <T,>(): T | null => {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

export const setUser = (user: unknown): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// nettoie tout (tokens + user) en un seul appel
export const clearAuth = (): void => {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
};

const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const payload = token.split('.')[1];
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(normalized)) as JwtPayload;
  } catch {
    return null;
  }
};

export const isTokenHalfExpired = (accessToken: string): boolean => {
  const payload = decodeJwt(accessToken);
  if (!payload) return true;

  const { iat, exp } = payload;
  const now = Date.now() / 1000;
  const halfLife = iat + (exp - iat) * 0.5;

  return now >= halfLife;
};


export const refreshAccessToken = async (): Promise<string> => {
  if (refreshPromise) return refreshPromise; // évite les appels concurrents

  const tokens = getAuthTokens();
  if (!tokens?.refreshToken) {
    clearAuth();
    throw new Error("NO_REFRESH_TOKEN");
  }

  refreshPromise = authService
    .refresh(tokens.refreshToken)
    .then(({ accessToken, expirationTime }) => {
      setAuthTokens({ ...tokens, accessToken, expirationTime }); // refreshToken conservé
      console.log('refresh good !')
      return accessToken;
    })
    .catch((err) => {
      clearAuth();
      throw err;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
};

export const ensureFreshToken = async (): Promise<string | null> => {
  const tokens = getAuthTokens();
  if (!tokens?.accessToken) return null;

  if (isTokenHalfExpired(tokens.accessToken)) {
    try {
      return await refreshAccessToken();
    } catch {
      return null;
    }
  }
  return tokens.accessToken;
};