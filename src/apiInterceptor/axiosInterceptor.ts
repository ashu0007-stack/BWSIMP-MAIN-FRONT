import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";

/* ===============================
   TYPES
================================ */

interface RefreshResponse {
  accessToken: string;
}

interface CustomRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

/* ===============================
   REFRESH QUEUE
================================ */

let isRefreshing = false;

let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token!);
  });
  failedQueue = [];
};

/* ===============================
   AXIOS INSTANCE
================================ */

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // 🔑 needed for refresh cookie
});

/* ===============================
   REQUEST INTERCEPTOR
================================ */

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (typeof window !== "undefined") {
      const token = sessionStorage.getItem("OAuthCredentials");

      // ✅ Attach token ONLY if it exists
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ===============================
   RESPONSE INTERCEPTOR
================================ */

axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,

  async (error: AxiosError) => {
    const originalRequest = error.config as CustomRequestConfig;

    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    /* ===============================
       DO NOT REFRESH FOR AUTH APIs
    ================================ */

    if (
      originalRequest.url?.includes("/auth/login") ||
      originalRequest.url?.includes("/auth/refreshToken")
    ) {
      return Promise.reject(error);
    }

    /* ===============================
       CHECK ACCESS TOKEN EXISTS
    ================================ */

    const accessToken =
      typeof window !== "undefined"
        ? sessionStorage.getItem("OAuthCredentials")
        : null;

    /* ===============================
       REFRESH ONLY IF:
       - 401 received
       - access token existed
       - not already retried
    ================================ */

    if (
      error.response.status === 401 &&
      accessToken &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      // Queue requests while refresh is in progress
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers!.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        });
      }

      isRefreshing = true;

      try {
        const { data } = await axiosInstance.post<RefreshResponse>(
          "/auth/refreshToken"
        );

        // ✅ Store new access token
        sessionStorage.setItem("OAuthCredentials", data.accessToken);

        processQueue(null, data.accessToken);

        // Retry original request
        originalRequest.headers!.Authorization = `Bearer ${data.accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        // 🔒 Force logout
        sessionStorage.removeItem("OAuthCredentials");
        await axiosInstance.post("/auth/logout");

        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
