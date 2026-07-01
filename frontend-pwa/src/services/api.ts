import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
  API_URL,
  CITIZENS_TOKEN_REFRESH_ENDPOINT,
} from "@/constants/config";
import { clearAuthFlowState, loadTokens, saveTokens } from "@/utils/authStorage";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { Accept: "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;

api.interceptors.request.use(async (config) => {
  const tokens = await loadTokens();
  if (tokens?.access) {
    config.headers.Authorization = `Bearer ${tokens.access}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.url?.includes("/token/refresh/")
    ) {
      original._retry = true;
      if (!refreshPromise) {
        refreshPromise = (async () => {
          const tokens = await loadTokens();
          if (!tokens?.refresh) {
            await clearAuthFlowState();
            return null;
          }
          try {
            const { data } = await axios.post<{
              access: string;
              refresh?: string;
            }>(`${API_URL}${CITIZENS_TOKEN_REFRESH_ENDPOINT}`, {
              refresh: tokens.refresh,
            });
            await saveTokens({
              access: data.access,
              refresh: data.refresh ?? tokens.refresh,
            });
            return data.access;
          } catch {
            await clearAuthFlowState();
            return null;
          } finally {
            refreshPromise = null;
          }
        })();
      }

      const access = await refreshPromise;
      if (access) {
        original.headers.Authorization = `Bearer ${access}`;
        return api(original);
      }
    }

    if (import.meta.env.DEV && error?.response) {
      console.warn(
        "[API]",
        error.config?.method?.toUpperCase(),
        error.config?.url,
        error.response.status,
        error.response.data,
      );
    }
    return Promise.reject(error);
  },
);
