import { StrictMode, startTransition } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { AbilityContext, ability } from "~@/authorization";
import { dynamicActivateLocale, I18nProvider, i18n, i18nLoader, Language } from "~@/i18n";

await dynamicActivateLocale(Language.ENGLISH_US);
i18nLoader();

startTransition(() => {
	hydrateRoot(
		document,
		<StrictMode>
			<I18nProvider i18n={i18n}>
				<AbilityContext value={ability}>
					<HydratedRouter />
				</AbilityContext>
			</I18nProvider>
		</StrictMode>,
	);
});
