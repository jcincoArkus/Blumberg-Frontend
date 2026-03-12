import { startTransition } from "react";
import { createRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { client } from "~@/api";
import { AbilityContext, ability } from "~@/authorization";
import { config } from "~@/config";
import { dynamicActivateLocale, I18nProvider, i18n, i18nLoader, Language } from "~@/i18n";
import { AppDataTableProvider, AppFormProvider } from "~@/ui";
import { authViewModel, setupAuthRefreshInterceptor } from "~@/view-model/auth";

await dynamicActivateLocale(config.defaultLocale as Language);

// Ensure every request gets the current token (covers session load timing and refresh updates)
client.instance.interceptors.request.use((req) => {
	const token = authViewModel.accessToken;
	if (token) {
		req.headers = req.headers ?? {};
		(req.headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
	}
	return req;
});
setupAuthRefreshInterceptor(client.instance);
i18nLoader();

startTransition(() =>
	createRoot(document).render(
		<I18nProvider i18n={i18n}>
			<AbilityContext value={ability}>
				<AppFormProvider>
					<AppDataTableProvider>
						<HydratedRouter />
					</AppDataTableProvider>
				</AppFormProvider>
			</AbilityContext>
		</I18nProvider>,
	),
);
