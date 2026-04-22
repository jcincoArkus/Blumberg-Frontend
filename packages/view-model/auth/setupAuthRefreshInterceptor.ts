import type { AxiosInstance } from "axios";

import type { AuthResponse } from "~@/api";
import { config } from "~@/config";

import { authViewModel } from "./AuthViewModel";

const REFRESH_URL = "/api/v1/auth/refresh";

/** Single in-flight refresh promise so concurrent 401s don't trigger multiple refreshes */
let refreshPromise: Promise<boolean> | null = null;

/**
 * Call the refresh endpoint with fetch (avoid using the same axios instance to prevent
 * the 401 interceptor from running on the refresh request).
 */
async function callRefresh(refreshToken: string, baseURL: string): Promise<AuthResponse | null> {
	const url = `${baseURL.replace(/\/$/, "")}${REFRESH_URL}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refreshToken }),
	});
	if (!res.ok) return null;
	return (await res.json()) as AuthResponse;
}

/**
 * Registers a response interceptor on the given axios instance to:
 * - On 401: try to refresh using the stored refresh token, update session, retry the request.
 * - If refresh fails or no refresh token: clear session and redirect to /login.
 * - Only one refresh runs at a time; concurrent 401s wait on the same refresh and then retry.
 */
export function setupAuthRefreshInterceptor(axiosInstance: AxiosInstance): void {
	const baseURL = config.api?.url ?? "";

	axiosInstance.interceptors.response.use(
		(response) => response,
		async (error) => {
			const originalRequest = error.config;

			if (error.response?.status !== 401) {
				return Promise.reject(error);
			}

			// Do not try refresh for the refresh endpoint itself
			if (originalRequest?.url?.includes("/auth/refresh")) {
				authViewModel.clearSession();
				redirectToLogin();
				return Promise.reject(error);
			}

			const refreshToken = authViewModel.refreshToken;
			if (!refreshToken) {
				authViewModel.clearSession();
				redirectToLogin();
				return Promise.reject(error);
			}

			// Reuse in-flight refresh
			if (!refreshPromise) {
				refreshPromise = (async () => {
					try {
						const data = await callRefresh(refreshToken, baseURL);
						if (data?.token) {
							authViewModel.setAuthenticatedSession({
								accessToken: data.token,
								refreshToken: data.refreshToken ?? data.token,
							});
							return true;
						}
					} finally {
						refreshPromise = null;
					}
					authViewModel.clearSession();
					redirectToLogin();
					return false;
				})();
			}

			const refreshed = await refreshPromise;
			if (!refreshed) {
				return Promise.reject(error);
			}

			// Retry the original request with the new token (client defaults already updated)
			originalRequest.headers = {
				...originalRequest.headers,
				Authorization: `Bearer ${authViewModel.accessToken}`,
			};
			return axiosInstance(originalRequest);
		},
	);
}

function redirectToLogin(): void {
	if (typeof window !== "undefined") {
		window.location.href = "/login";
	}
}
