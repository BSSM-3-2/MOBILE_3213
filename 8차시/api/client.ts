import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import Constants from 'expo-constants';

export const BASE_URL =
    (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
    process.env.EXPO_PUBLIC_API_URL;

if (!BASE_URL) {
    throw new Error(
        'EXPO_PUBLIC_API_URL is not configured. Add it to .env and app.config.ts extra.',
    );
}

type RetryableRequestConfig = InternalAxiosRequestConfig & {
    _retry?: boolean;
};

type PendingRequest = {
    resolve: (token: string) => void;
    reject: (error: unknown) => void;
};

const AUTH_REFRESH_EXEMPT_PATHS = [
    '/auth/login',
    '/auth/signup',
    '/auth/refresh',
    '/auth/logout',
];

let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

const isAuthRefreshExemptRequest = (url?: string) =>
    AUTH_REFRESH_EXEMPT_PATHS.some(path => url?.includes(path));

const setAuthorizationHeader = (
    config: RetryableRequestConfig,
    token: string,
) => {
    config.headers.Authorization = `Bearer ${token}`;
};

const processPendingQueue = (error: unknown, token: string | null) => {
    pendingQueue.forEach(({ resolve, reject }) => {
        if (error || !token) {
            reject(error ?? new Error('Token refresh failed'));
        } else {
            resolve(token);
        }
    });
    pendingQueue = [];
};

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor
// 모든 요청 전에 실행 — 토큰 주입
apiClient.interceptors.request.use(
    config => {
        // auth-store를 직접 import하면 순환 참조가 생기므로 동적으로 참조
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require('@/store/auth-store');
        const token: string | null = useAuthStore.getState().accessToken;
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    error => Promise.reject(error),
);

// Response Interceptor
// 모든 응답 후에 실행 — 에러 코드를 한 곳에서 처리
apiClient.interceptors.response.use(
    response => response,
    async (error: AxiosError) => {
        const status = error.response?.status;
        const originalConfig = error.config as
            | RetryableRequestConfig
            | undefined;

        if (status === 404) {
            console.warn('[API] 리소스를 찾을 수 없습니다:', error.config?.url);
            return Promise.reject(error);
        }

        if (status === 401) {
            if (
                !originalConfig ||
                isAuthRefreshExemptRequest(originalConfig.url)
            ) {
                return Promise.reject(error);
            }

            // eslint-disable-next-line @typescript-eslint/no-require-imports
            const { useAuthStore } = require('@/store/auth-store');
            const store = useAuthStore.getState();

            if (originalConfig._retry) {
                await store.logOut();
                return Promise.reject(error);
            }

            originalConfig._retry = true;

            if (!store.refreshToken) {
                await store.logOut();
                return Promise.reject(error);
            }

            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    pendingQueue.push({
                        resolve: token => {
                            setAuthorizationHeader(originalConfig, token);
                            resolve(apiClient(originalConfig));
                        },
                        reject,
                    });
                });
            }

            isRefreshing = true;

            try {
                const newAccessToken = await store.refreshAccessToken();
                setAuthorizationHeader(originalConfig, newAccessToken);
                processPendingQueue(null, newAccessToken);
                return apiClient(originalConfig);
            } catch (refreshError) {
                processPendingQueue(refreshError, null);
                await useAuthStore.getState().logOut();
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }

        console.error('[API] 서버 에러:', status, error.message);
        return Promise.reject(error);
    },
);

export default apiClient;
