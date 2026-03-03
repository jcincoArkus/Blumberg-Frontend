import { client } from "~@/api";
import { makeAutoObservable } from "~@/mobx";

const AUTH_SESSION_KEY = "authenticatedSession";

export interface AuthenticatedSession {
	accessToken: string;
	refreshToken: string;
}

class AuthViewModel {
	_authenticatedSession: AuthenticatedSession | null = null;

	constructor() {
		makeAutoObservable(this);
		this._loadSessionFromStorage();
	}

	_loadSessionFromStorage() {
		try {
			const storedSession = sessionStorage.getItem(AUTH_SESSION_KEY);
			if (!storedSession) {
				this._authenticatedSession = null;
				return;
			}
			this.setAuthenticatedSession(JSON.parse(storedSession) as AuthenticatedSession);
		} catch {
			this._authenticatedSession = null;
		}
	}

	get isAuthenticated() {
		return this._authenticatedSession != null;
	}

	get accessToken() {
		return this._authenticatedSession?.accessToken;
	}

	get refreshToken() {
		return this._authenticatedSession?.refreshToken;
	}

	setAuthenticatedSession = (session: AuthenticatedSession) => {
		sessionStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
		client.setConfig({
			headers: {
				Authorization: `Bearer ${session.accessToken}`,
			},
		});
		this._authenticatedSession = session;
	};

	clearSession = () => {
		sessionStorage.removeItem(AUTH_SESSION_KEY);
		client.setConfig({
			headers: {
				Authorization: undefined,
			},
		});
		this._authenticatedSession = null;
	};
}

export const authViewModel = new AuthViewModel();

export function useAuthViewModel() {
	return authViewModel;
}
