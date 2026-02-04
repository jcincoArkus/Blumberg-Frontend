import { startTransition } from "react";
import { createRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { AbilityContext, ability } from "~@/authorization";
import { config } from "~@/config";
import { dynamicActivateLocale, I18nProvider, i18n, i18nLoader, Language } from "~@/i18n";
import { AppDataTableProvider } from "~@/ui";

await dynamicActivateLocale(config.defaultLocale as Language);
i18nLoader();

startTransition(() =>
	createRoot(document).render(
		<I18nProvider i18n={i18n}>
			<AbilityContext value={ability}>
				<AppDataTableProvider>
					<HydratedRouter />
				</AppDataTableProvider>
			</AbilityContext>
		</I18nProvider>,
	),
);
