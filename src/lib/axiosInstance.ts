import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
});

axiosInstance.interceptors.request.use((config) => {
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
        config.headers.delete('Content-Type');
    }
    return config;
});


let isRefreshing = false;
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve();
        }
    });

    failedQueue = [];
};

axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
            // If a login or refresh request itself fails with a 401, it immediately rejects the promise rather than trying to refresh again, preventing a cascading loop.
            if (originalRequest.url?.includes('auth/login') || 
                originalRequest.url?.includes('auth/register') ||
                originalRequest.url?.includes('auth/refresh-token')) {
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // When a request fails with a 401, the interceptor checks if another request is already in the process of refreshing the token.
                
                // If isRefreshing is true, it means a refresh request has already been sent to the server, and this new failed request needs to wait.
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                .then(() => {
                    return axiosInstance(originalRequest);
                })
                .catch((err) => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
                    {},
                    {
                        withCredentials: true,
                    }
                );

                processQueue();
                isRefreshing = false;

                return axiosInstance(originalRequest);
            } catch (refreshError) {
                processQueue(refreshError as Error);
                isRefreshing = false;

                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }

                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

