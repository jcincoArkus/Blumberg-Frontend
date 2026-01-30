import { makeAutoObservable } from "mobx";
import { useEffect } from "react";
import { Outlet } from "react-router";

import { authorizationController } from "~@/authorization";
import { DashboardShell } from "~@/views";

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

export async function clientLoader() {
	// Continue loading authorization
	privateRouteController.load();
	return {};
}

/**
 * Private layout route.
 * Wraps all private routes with DashboardShell (sidebar + header).
 * This ensures consistent navigation across all authenticated pages.
 */
export default function Private() {
	useEffect(() => {
		return () => {
			privateRouteController.dispose();
		};
	}, []);

	if (authorizationController.isLoading) {
		return <div>Loading...</div>;
	}

	return (
		<DashboardShell>
			<Outlet />
		</DashboardShell>
	);
}
