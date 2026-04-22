import type { ReactNode } from "react";
import type { UseFormReturn } from "react-hook-form";

import { FormField } from "./FormField";
import type {
	FormComponentOverrides,
	FormSchema,
	FormValues,
	GroupFieldSchema,
	StepContentProps,
	StepIndicatorProps,
	StepNavigationProps,
} from "./types";
import { useHiddenFields } from "./useHiddenFields";
import { useMultiStepForm } from "./useMultiStepForm";

// ─── Default unstyled fallbacks ──────────────────────────────

function DefaultStepIndicator({ steps, currentStep }: StepIndicatorProps) {
	return (
		<div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
			{steps.map((step) => (
				<span key={step.key} style={{ fontWeight: step.index === currentStep ? "bold" : "normal" }}>
					{step.index + 1}. {step.header ?? step.key}
				</span>
			))}
		</div>
	);
}

function DefaultStepNavigation({
	isFirstStep,
	isLastStep,
	onBack,
	onNext,
	submitLabel,
}: StepNavigationProps) {
	return (
		<div style={{ display: "flex", justifyContent: "space-between", marginTop: 16 }}>
			<div>
				{!isFirstStep && (
					<button type="button" onClick={onBack}>
						Back
					</button>
				)}
			</div>
			<div>
				{isLastStep ? (
					<button type="submit">{submitLabel ?? "Submit"}</button>
				) : (
					<button type="button" onClick={onNext}>
						Next
					</button>
				)}
			</div>
		</div>
	);
}

function DefaultStepContent({ step, children }: StepContentProps) {
	return (
		<div>
			{step.header && <h3>{step.header}</h3>}
			{step.description && <p>{step.description}</p>}
			{children}
		</div>
	);
}

// ─── MultiStepForm Component ─────────────────────────────────

interface MultiStepFormProps {
	schema: FormSchema;
	form: UseFormReturn<FormValues>;
	components: FormComponentOverrides;
	formId: string;
	onSubmit: (values: FormValues) => void | Promise<void>;
	submitLabel?: string;
	isSubmitting?: boolean;
	children?: ReactNode;
}

export function MultiStepForm({
	schema,
	form,
	components,
	formId,
	onSubmit,
	submitLabel,
	isSubmitting,
	children,
}: MultiStepFormProps) {
	const { steps, currentStep, isFirstStep, isLastStep, goToNext, goToPrevious } = useMultiStepForm(
		schema,
		form,
	);

	const hiddenFields = useHiddenFields(schema);

	// Resolve layout components
	const StepIndicator = components.StepIndicator ?? DefaultStepIndicator;
	const StepNavigation = components.StepNavigation ?? DefaultStepNavigation;
	const StepContent = components.StepContent ?? DefaultStepContent;

	// Get current step's fields
	const stepEntries = Object.entries(schema).filter(([, field]) => field.type === "group") as [
		string,
		GroupFieldSchema,
	][];
	const [, currentStepField] = stepEntries[currentStep];

	const handleFormSubmit = form.handleSubmit((values) => {
		// Filter out hidden fields before submitting
		const filtered: FormValues = {};
		for (const key of Object.keys(values)) {
			if (!hiddenFields.has(key)) {
				filtered[key] = values[key];
			}
		}
		onSubmit(filtered);
	});

	const handleStepSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (isLastStep) {
			await handleFormSubmit();
		} else {
			await goToNext();
		}
	};

	return (
		<form id={formId} onSubmit={handleStepSubmit} noValidate>
			<StepIndicator steps={steps} currentStep={currentStep} />

			<StepContent step={steps[currentStep]}>
				{Object.entries(currentStepField.fields).map(([name, field]) => {
					if (field.type === "group") return null;
					return (
						<FormField
							key={name}
							name={name}
							field={field}
							components={components}
							formId={formId}
						/>
					);
				})}
			</StepContent>

			<StepNavigation
				isFirstStep={isFirstStep}
				isLastStep={isLastStep}
				isSubmitting={isSubmitting}
				onBack={goToPrevious}
				onNext={goToNext}
				submitLabel={submitLabel}
			/>

			{children}
		</form>
	);
}
