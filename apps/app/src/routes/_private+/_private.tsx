import { makeAutoObservable } from "mobx";
import { useEffect } from "react";
import { Outlet } from "react-router";

import { authorizationController } from "~@/authorization";

class PrivateRouteController {
	constructor() {
		makeAutoObservable(this);
	}

	get isLoading() {
		return authorizationController.isLoading;
	}

	async load() {
		await authorizationController.load();
	}

	dispose() {}
}

export const privateRouteController = new PrivateRouteController();

export function loader() {
	return privateRouteController.load();
}

export default function Private() {
	useEffect(() => {
		return () => {
			privateRouteController.dispose();
		};
	}, []);

	if (authorizationController.isLoading) {
		return <div>Loading...</div>;
	}

	return <Outlet />;
}
