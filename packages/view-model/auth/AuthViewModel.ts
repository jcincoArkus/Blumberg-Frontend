import { client } from "~@/api";
import { makeAutoObservable } from "~@/mobx";

const AUTH_SESSION_KEY = "authenticatedSession";

export interface AuthenticatedSession {
	accessToken: string;
	refreshToken: string;
}

/** Signed-in user, derived from the access token claims. */
export interface CurrentUser {
	id: string | null;
	email: string;
	firstName: string;
	lastName: string;
	/** "First Last", falling back to the email when the token has no name claims. */
	displayName: string;
	/** Up to two uppercase initials for avatars. */
	initials: string;
	/** When the current access token was issued (ISO), i.e. the last sign-in / refresh. */
	signedInAt?: string;
}

/** Decodes the payload of a JWT without verifying it (display purposes only). */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
	try {
		const part = token.split(".")[1];
		if (!part) return null;
		const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
		const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
		const binary = atob(padded);
		const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
		return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
	} catch {
		return null;
	}
}

function claim(payload: Record<string, unknown>, ...keys: string[]): string {
	for (const key of keys) {
		const v = payload[key];
		if (typeof v === "string" && v.trim()) return v.trim();
	}
	return "";
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

	/** Current user from the JWT claims (given_name / family_name / email / sub). */
	get currentUser(): CurrentUser | null {
		const token = this._authenticatedSession?.accessToken;
		if (!token) return null;
		const payload = decodeJwtPayload(token);
		if (!payload) return null;
		const email = claim(
			payload,
			"email",
			"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress",
		);
		const firstName = claim(
			payload,
			"given_name",
			"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname",
		);
		const lastName = claim(
			payload,
			"family_name",
			"http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname",
		);
		const displayName = [firstName, lastName].filter(Boolean).join(" ") || email;
		const initials =
			[firstName, lastName]
				.filter(Boolean)
				.map((n) => n[0])
				.join("")
				.toUpperCase() ||
			(email[0]?.toUpperCase() ?? "?");
		return {
			id: claim(payload, "sub") || null,
			email,
			firstName,
			lastName,
			displayName,
			initials: initials.slice(0, 2),
			signedInAt:
				typeof payload.iat === "number" ? new Date(payload.iat * 1000).toISOString() : undefined,
		};
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
