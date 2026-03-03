import type { ReactNode } from "react";

import { type FormComponentOverrides, FormConfigProvider } from "~@/forms";

import { SelectField, TextareaField, TextField } from "./fields";
import { AppSubmitButton } from "./SubmitButton";

const components: FormComponentOverrides = {
	text: TextField,
	textarea: TextareaField,
	select: SelectField,
	SubmitButton: AppSubmitButton,
};

export function AppFormProvider({ children }: { children: ReactNode }) {
	return <FormConfigProvider value={{ components }}>{children}</FormConfigProvider>;
}
