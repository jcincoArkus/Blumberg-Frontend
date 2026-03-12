import { makeAutoObservable } from "mobx";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";

import { authorizationController } from "~@/authorization";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { authViewModel } from "~@/view-model/auth";
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
function Private() {
	const navigate = useNavigate();
	const { isAuthenticated } = authViewModel;

	useEffect(() => {
		if (!isAuthenticated) {
			navigate("/", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	useEffect(() => {
		return () => {
			privateRouteController.dispose();
		};
	}, []);

	if (authorizationController.isLoading) {
		return <div>{t`Loading...`}</div>;
	}

	if (!authViewModel.isAuthenticated) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-background">
				<p className="text-muted-foreground">{t`Redirecting to sign in...`}</p>
			</div>
		);
	}

	return (
		<DashboardShell>
			<Outlet />
		</DashboardShell>
	);
}

export default observer(Private);
