import { useCallback, useRef } from "react";

import type { FormRefHandle, FormValues } from "./types";

/**
 * Hook for imperative control of a Form component.
 * Returns a ref to attach to `<Form>` and convenience wrappers.
 */
export function useFormRef() {
	const formRef = useRef<FormRefHandle>(null);

	const submitForm = useCallback(async () => {
		await formRef.current?.submitForm();
	}, []);

	const resetForm = useCallback((values?: FormValues) => {
		formRef.current?.resetForm(values);
	}, []);

	const clearForm = useCallback(() => {
		formRef.current?.clearForm();
	}, []);

	const getFormValues = useCallback((): FormValues => {
		return formRef.current?.getFormValues() ?? {};
	}, []);

	const setFormValues = useCallback((values: Partial<FormValues>) => {
		formRef.current?.setFormValues(values);
	}, []);

	return { formRef, submitForm, resetForm, clearForm, getFormValues, setFormValues };
}
