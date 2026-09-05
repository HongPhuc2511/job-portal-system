import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

const axiosClient = axios.create({
	baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
	headers: { "Content-Type": "application/json" },
});

axiosClient.interceptors.request.use((config) => {
	const token = localStorage.getItem("access_token");
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

// --- Refresh token ---
type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
	if (!refreshPromise) {
		refreshPromise = (async () => {
			const refresh_token = localStorage.getItem("refresh_token");
			if (!refresh_token) return null;
			try {
				const { data } = await axios.post(
					`${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/auth/refresh`,
					null,
					{ headers: { Authorization: `Bearer ${refresh_token}` } },
				);
				const access_token = data?.access_token;
				if (access_token) localStorage.setItem("access_token", access_token);
				if (data?.refresh_token)
					localStorage.setItem("refresh_token", data.refresh_token);
				return access_token ?? null;
			} catch {
				return null;
			} finally {
				refreshPromise = null;
			}
		})();
	}
	return refreshPromise;
}

axiosClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError) => {
		const original = error.config as RetryConfig | undefined;
		if (error.response?.status !== 401 || !original || original._retry) {
			return Promise.reject(error);
		}
		original._retry = true;

		const token = await refreshAccessToken();
		if (!token) {
			localStorage.removeItem("access_token");
			localStorage.removeItem("refresh_token");
			return Promise.reject(error);
		}

		original.headers.Authorization = `Bearer ${token}`;
		return axiosClient(original);
	},
);

export default axiosClient;
