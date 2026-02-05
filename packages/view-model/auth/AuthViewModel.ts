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
			const storedSession = localStorage.getItem(AUTH_SESSION_KEY);
			this._authenticatedSession = storedSession ? JSON.parse(storedSession) : null;
		} catch {
			this._authenticatedSession = null;
		}
	}

	get isAuthenticated() {
		return true;
		// return this._authenticatedSession != null;
	}

	get accessToken() {
		return this._authenticatedSession?.accessToken;
	}

	setAuthenticatedSession = (session: AuthenticatedSession) => {
		this._authenticatedSession = session;
		localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(session));
	};

	clearSession = () => {
		this._authenticatedSession = null;
	};
}

export const authViewModel = new AuthViewModel();

export function useAuthViewModel() {
	return authViewModel;
}
