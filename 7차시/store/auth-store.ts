import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import User from '@type/User';
import {
    signup,
    login,
    logout as authLogout,
    refreshToken as authRefresh,
    SignupPayload,
    LoginPayload,
} from '@/api/auth';
import { getMe } from '@/api/users';

const TOKEN_KEY = 'accessToken';
const REFRESH_KEY = 'refreshToken';

export type AuthStatus = 'checking' | 'authenticated' | 'guest';

const saveTokens = async (accessToken: string, refreshToken: string) => {
    await Promise.all([
        SecureStore.setItemAsync(TOKEN_KEY, accessToken),
        SecureStore.setItemAsync(REFRESH_KEY, refreshToken),
    ]);
};

const deleteTokens = async () => {
    await Promise.all([
        SecureStore.deleteItemAsync(TOKEN_KEY),
        SecureStore.deleteItemAsync(REFRESH_KEY),
    ]);
};

interface AuthState {
    user: User | null;
    accessToken: string | null;
    refreshToken: string | null;
    status: AuthStatus;
    loading: boolean;
    error: string | null;

    bootstrap: () => Promise<void>;
    signUp: (payload: SignupPayload) => Promise<void>;
    logIn: (payload: LoginPayload) => Promise<void>;
    logOut: () => Promise<void>;
    refreshAccessToken: () => Promise<string>;
    setTokens: (accessToken: string, refreshToken: string) => void;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    accessToken: null,
    refreshToken: null,
    status: 'checking',
    loading: false,
    error: null,

    bootstrap: async () => {
        set({ status: 'checking', error: null });

        const [storedAccessToken, storedRefreshToken] = await Promise.all([
            SecureStore.getItemAsync(TOKEN_KEY),
            SecureStore.getItemAsync(REFRESH_KEY),
        ]);

        if (!storedAccessToken || !storedRefreshToken) {
            await deleteTokens();
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                status: 'guest',
            });
            return;
        }

        set({
            accessToken: storedAccessToken,
            refreshToken: storedRefreshToken,
        });

        try {
            const user = await getMe();
            set({ user, status: 'authenticated' });
        } catch {
            await deleteTokens();
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                status: 'guest',
            });
        }
    },

    signUp: async payload => {
        set({ loading: true, error: null });
        try {
            const res = await signup(payload);
            await saveTokens(res.accessToken, res.refreshToken);
            set({
                user: res.user,
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                status: 'authenticated',
                loading: false,
            });
        } catch (err: unknown) {
            const serverRes = (
                err as { response?: { data?: { message?: string } } }
            ).response;
            const message = serverRes
                ? (serverRes.data?.message ?? '회원가입에 실패했습니다.')
                : '서버와 통신 중 오류가 발생했습니다.';
            set({ error: message, loading: false });
            throw err;
        }
    },

    logIn: async payload => {
        set({ loading: true, error: null });
        try {
            const res = await login(payload);
            await saveTokens(res.accessToken, res.refreshToken);
            set({
                user: res.user,
                accessToken: res.accessToken,
                refreshToken: res.refreshToken,
                status: 'authenticated',
                loading: false,
            });
        } catch (err: unknown) {
            const serverRes = (
                err as { response?: { data?: { message?: string } } }
            ).response;
            const message = serverRes
                ? (serverRes.data?.message ?? '로그인에 실패했습니다.')
                : '서버와 통신 중 오류가 발생했습니다.';
            set({ error: message, loading: false });
            throw err;
        }
    },

    logOut: async () => {
        const currentRefreshToken = get().refreshToken;

        if (currentRefreshToken) {
            authLogout(currentRefreshToken).catch(() => {});
        }

        try {
            await deleteTokens();
        } finally {
            set({
                user: null,
                accessToken: null,
                refreshToken: null,
                status: 'guest',
                loading: false,
                error: null,
            });
        }
    },

    refreshAccessToken: async () => {
        const currentRefreshToken = get().refreshToken;

        if (!currentRefreshToken) {
            throw new Error('No refresh token');
        }

        const res = await authRefresh(currentRefreshToken);
        await saveTokens(res.accessToken, res.refreshToken);
        set({
            user: res.user,
            accessToken: res.accessToken,
            refreshToken: res.refreshToken,
            status: 'authenticated',
            error: null,
        });
        return res.accessToken;
    },

    setTokens: (accessToken, refreshToken) => {
        set({ accessToken, refreshToken, status: 'authenticated' });
    },

    clearError: () => set({ error: null }),
}));
