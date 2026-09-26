import { makeAutoObservable } from "mobx";
import { useEffect } from "react";
import { Outlet, useNavigate, useNavigation } from "react-router";

import { authorizationController } from "~@/authorization";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { LoadingState, TopProgressBar } from "~@/ui";
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
	const navigation = useNavigation();
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
		return (
			<div className="flex min-h-screen items-center justify-center bg-background">
				<LoadingState variant="page" label={t`Loading your workspace…`} />
			</div>
		);
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
			{/* Slim top bar while React Router loads the next module (route chunk / loaders) */}
			<TopProgressBar active={navigation.state === "loading"} />
			<Outlet />
		</DashboardShell>
	);
}

export default observer(Private);
