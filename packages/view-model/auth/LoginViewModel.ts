import { loginV1ObservedMutation } from "~@/api";
import { makeAutoObservable } from "~@/mobx";

import { authViewModel } from "./AuthViewModel";

/**
 * ViewModel for the login page.
 * Integrates login API mutation and sets auth session on success.
 */
class LoginViewModel {
	private readonly _loginMutation = loginV1ObservedMutation();

	constructor() {
		makeAutoObservable(this);
	}

	get isPending(): boolean {
		return this._loginMutation?.isPending ?? false;
	}

	get hasError(): boolean {
		return this._loginMutation?.hasError ?? false;
	}

	get error(): Error | null {
		return this._loginMutation?.error ?? null;
	}

	/**
	 * Submit login with email and password.
	 * Calls API and sets auth session on success.
	 * @throws when API fails or response has no token
	 */
	login = async (email: string, password: string): Promise<void> => {
		const result = await this._loginMutation.mutateAsync({
			body: { email: email.trim(), password },
		});

		const token = result?.token ?? null;
		if (!token) {
			throw new Error("No token in response");
		}
		const refreshToken = result?.refreshToken ?? token;

		authViewModel.setAuthenticatedSession({
			accessToken: token,
			refreshToken,
		});
	};

	/** Clear mutation state (e.g. error). */
	reset = (): void => {
		this._loginMutation?.dispose();
	};
}

export const loginViewModel = new LoginViewModel();

export function useLoginViewModel() {
	return loginViewModel;
}
