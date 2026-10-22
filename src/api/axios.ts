import axios from "axios";

const baseURL =
    import.meta.env.VITE_API_URL ||
    "https://apiweb-dev.cenabast.cl/sagi-api/api/sagi/v1";

const api = axios.create({
    baseURL
});

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;

