import { startTransition } from "react";
import { createRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { client } from "~@/api";
import { AbilityContext, ability } from "~@/authorization";
import { config } from "~@/config";
import { dynamicActivateLocale, I18nProvider, i18n, i18nLoader, Language } from "~@/i18n";
import { AppDataTableProvider, AppFormProvider } from "~@/ui";
import { setupAuthRefreshInterceptor } from "~@/view-model";

await dynamicActivateLocale(config.defaultLocale as Language);
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
