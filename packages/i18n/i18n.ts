import { i18n, type Messages } from "@lingui/core";
import { compileMessage } from "@lingui/message-utils/compileMessage";
import { makeAutoObservable, reaction } from "mobx";

import { Language } from "./language.enum";

i18n.setMessagesCompiler(compileMessage);

i18n.load(Language.ENGLISH_US, {});
i18n.activate(Language.ENGLISH_US);

const configLocale = (import.meta.env.VITE_DEFAULT_LOCALE as Language) ?? Language.ENGLISH_US;

export async function dynamicActivateLocale(locale: Language): Promise<void> {
	const { messages } = (await import(`./messages/${locale}.json?lingui`)) as { messages: Messages };
	i18n.load(locale, messages);
	i18n.activate(locale);
}

class LocaleController {
	locale: Language = configLocale;

	constructor() {
		makeAutoObservable(this);
	}

	setLocale(locale: Language | null) {
		this.locale = locale ?? Language.ENGLISH_US;
	}
}

export const localeController = new LocaleController();

export function i18nLoader(): void {
	reaction(
		() => ({
			configLocale: configLocale,
			workspaceLocale: undefined,
			userLocale: undefined,
			directLocale: localeController.locale,
		}),
		async (locales) => {
			const { configLocale, workspaceLocale, userLocale, directLocale } = locales;

			if (directLocale) {
				await dynamicActivateLocale(directLocale).catch((error) => {
					// eslint-disable-next-line no-console
					console.error(`Failed to load ${directLocale} locale:`, error);
				});
			}

			const apiLocales = (userLocale ?? workspaceLocale) as keyof typeof Language | undefined;
			const apiLocalesResolved = apiLocales ? Language[apiLocales] : undefined;
			const chosenLocale = apiLocalesResolved ?? configLocale ?? Language.ENGLISH_US;
			const finalLocale = directLocale ?? chosenLocale;
			const locale = configLocale === Language.PSEUDO ? Language.PSEUDO : finalLocale;

			await dynamicActivateLocale(locale).catch((error) => {
				// eslint-disable-next-line no-console
				console.error(`Failed to load ${locale} locale:`, error);
			});
		},
		{ name: "i18n locale loader", fireImmediately: true },
	);
}
