import { makeAutoObservable } from "mobx";

class AuthorizationController {
	isLoading = false;

	constructor() {
		makeAutoObservable(this);
	}

	async load() {
		this.isLoading = true;
		// TODO: build from API
		// ability.update([{ action: AdminActions.ReadAllAdmins, subject: AdminActions }]);
		this.isLoading = false;
	}
}

export const authorizationController = new AuthorizationController();
