import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_URL || '';

const shouldStripApiPrefix = (baseUrl) => typeof baseUrl === 'string' && baseUrl.endsWith('/api');

const normalizeUrl = (url, baseUrl) => {
    if (typeof url !== 'string') {
        return url;
    }

    if (!shouldStripApiPrefix(baseUrl)) {
        return url;
    }

    return url.replace(/^\/api(?=\/)/, '');
};

const api = axios.create({
    baseURL: apiBaseUrl,
    withCredentials: true,
});

api.interceptors.request.use(
    (config) => {
        const activeBaseUrl = config.baseURL ?? apiBaseUrl;
        config.url = normalizeUrl(config.url, activeBaseUrl);
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Optional: trigger a logout or redirect to login.
        }
        return Promise.reject(error);
    }
);

export default api;
