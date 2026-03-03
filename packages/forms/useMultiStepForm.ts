import { useCallback, useState } from "react";
import type { UseFormReturn } from "react-hook-form";

import type { FormSchema, FormValues, GroupFieldSchema, StepInfo } from "./types";

interface UseMultiStepFormReturn {
	steps: StepInfo[];
	currentStep: number;
	totalSteps: number;
	isFirstStep: boolean;
	isLastStep: boolean;
	completedSteps: Set<number>;
	goToNext: () => Promise<void>;
	goToPrevious: () => void;
	resetSteps: () => void;
}

/**
 * Hook for multi-step form navigation.
 * Extracts steps from top-level group fields in the schema.
 */
export function useMultiStepForm(
	schema: FormSchema,
	form: UseFormReturn<FormValues>,
): UseMultiStepFormReturn {
	const [currentStep, setCurrentStep] = useState(0);
	const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());

	// Extract steps from schema entries that are groups
	const stepEntries = Object.entries(schema).filter(([, field]) => field.type === "group") as [
		string,
		GroupFieldSchema,
	][];

	const totalSteps = stepEntries.length;

	const steps: StepInfo[] = stepEntries.map(([key, field], index) => ({
		key,
		index,
		header: field.header,
		description: field.description,
		isActive: index === currentStep,
		isCompleted: completedSteps.has(index),
	}));

	const goToNext = useCallback(async () => {
		if (currentStep >= totalSteps - 1) return;

		// Get field names for the current step
		const [, stepField] = stepEntries[currentStep];
		const fieldNames = Object.keys(stepField.fields);

		// Validate current step fields
		const isValid = await form.trigger(fieldNames);
		if (!isValid) return;

		setCompletedSteps((prev) => new Set(prev).add(currentStep));
		setCurrentStep((prev) => prev + 1);
	}, [currentStep, totalSteps, stepEntries, form]);

	const goToPrevious = useCallback(() => {
		if (currentStep > 0) {
			setCurrentStep((prev) => prev - 1);
		}
	}, [currentStep]);

	const resetSteps = useCallback(() => {
		setCurrentStep(0);
		setCompletedSteps(new Set());
	}, []);

	return {
		steps,
		currentStep,
		totalSteps,
		isFirstStep: currentStep === 0,
		isLastStep: currentStep === totalSteps - 1,
		completedSteps,
		goToNext,
		goToPrevious,
		resetSteps,
	};
}
