import { useEffect } from "react";
import { useNavigate } from "react-router";

import { t } from "~@/i18n/macro";
import { authViewModel } from "~@/view-model/auth";

import type { Route } from "./+types/_index";

export async function clientLoader() {
	return { isAuthenticated: authViewModel.isAuthenticated };
}

export default function Index({ loaderData }: Route.ComponentProps) {
	const navigate = useNavigate();
	const { isAuthenticated } = loaderData;

	useEffect(() => {
		if (isAuthenticated) {
			navigate("/home", { replace: true });
		} else {
			navigate("/login", { replace: true });
		}
	}, [isAuthenticated, navigate]);

	return <div>{t`Loading...`}</div>;
}
