import { QueryClient, QueryFunction } from "@tanstack/react-query";

const API_BASE = (import.meta.env.VITE_API_BASE ?? "http://localhost:4000").replace(/\/$/, "");
export const ACCESS_TOKEN_KEY = "access_token";

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions {
  params?: Record<string, any>;
  headers?: HeadersInit;
}

function resolveUrl(path: string, params?: Record<string, any>) {
  const absolute = /^https?:\/\//i.test(path) ? path : `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const url = new URL(absolute);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") return;
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  const headers: HeadersInit = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

async function parseResponse(res: Response) {
  const text = await res.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export async function apiRequest<T = any>(method: string, path: string, data?: unknown, options?: RequestOptions): Promise<T> {
  const url = resolveUrl(path, options?.params);
  const headers: HeadersInit = {
    Accept: "application/json",
    ...options?.headers,
    ...getAuthHeaders(),
  };
  if (data !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    body: data !== undefined ? JSON.stringify(data) : undefined,
  });

  const payload = await parseResponse(res);
  if (!res.ok) {
    const message = (payload as any)?.message ?? res.statusText;
    throw new ApiError(message, res.status, payload);
  }
  const normalized = typeof payload === "object" && payload !== null && "data" in (payload as any) ? (payload as any).data : payload;
  return (normalized ?? null) as T;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: { on401: UnauthorizedBehavior }) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const [path, params] = queryKey as [string, Record<string, any>?];
    try {
      return await apiRequest<T>("GET", path, undefined, { params });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401 && unauthorizedBehavior === "returnNull") {
        return null as T;
      }
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
