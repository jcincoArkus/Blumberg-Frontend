import type { ReactElement, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

import type { FormComponentOverrides } from "./types";

export interface FormConfig {
	mode?: "onBlur" | "onChange" | "onSubmit";
}

export interface FormDefaults {
	components?: FormComponentOverrides;
	config?: FormConfig;
}

const FormConfigContext = createContext<FormDefaults | null>(null);

export function FormConfigProvider({
	children,
	value,
}: {
	children: ReactNode;
	value: FormDefaults;
}): ReactElement {
	const inherited = useContext(FormConfigContext);

	const merged = useMemo<FormDefaults>(
		() => ({
			components: { ...inherited?.components, ...value.components },
			config: { ...inherited?.config, ...value.config },
		}),
		[inherited, value],
	);

	return <FormConfigContext.Provider value={merged}>{children}</FormConfigContext.Provider>;
}

export function useFormConfig(): FormDefaults {
	return useContext(FormConfigContext) || {};
}
