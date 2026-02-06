import type { ReactNode } from "react";

import { type FormComponentOverrides, FormConfigProvider } from "~@/forms";

const components: FormComponentOverrides = {};

export function AppFormProvider({ children }: { children: ReactNode }) {
	return <FormConfigProvider value={{ components }}>{children}</FormConfigProvider>;
}
