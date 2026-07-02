import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import {
  API_URL,
  CITIZENS_TOKEN_REFRESH_ENDPOINT,
  COMPLAINTS_ENDPOINT,
} from "@/constants/config";
import { clearAuthFlowState, loadTokens, saveTokens } from "@/utils/authStorage";

export const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: { Accept: "application/json" },
});

let refreshPromise: Promise<string | null> | null = null;

function isPublicComplaintCreate(config: InternalAxiosRequestConfig): boolean {
  if ((config.method ?? "").toLowerCase() !== "post") return false;
  const url = (config.url ?? "").replace(/\/$/, "");
  const endpoint = COMPLAINTS_ENDPOINT.replace(/\/$/, "");
  return url === endpoint || url.endsWith(endpoint);
}

api.interceptors.request.use(async (config) => {
  if (config.data instanceof FormData && config.headers) {
    // Axios must not set multipart Content-Type without a boundary.
    if (typeof config.headers.set === "function") {
      config.headers.set("Content-Type", false);
    } else {
      delete config.headers["Content-Type"];
      delete config.headers["content-type"];
    }
  }

  if (isPublicComplaintCreate(config)) {
    return config;
  }

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
