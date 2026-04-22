import { z } from "zod";

import type { EquipmentRequest } from "~@/api";
import type { FormSchema } from "~@/forms";
import { Form } from "~@/forms";
import { t } from "~@/i18n/macro";

export interface EquipmentFormProps {
	siteOptions: Array<{ label: string; value: string }>;
	defaultValues?: Partial<{ name: string; equipmentType: string; siteId: string }>;
	onSubmit: (data: EquipmentRequest) => void | Promise<void>;
	submitLabel?: string;
	isSubmitting?: boolean;
}

const getEquipmentFormSchema = (
	siteOptions: Array<{ label: string; value: string }>,
): FormSchema => ({
	name: {
		type: "text",
		label: t`Name`,
		placeholder: t`Equipment name`,
		validator: z.string().min(1, t`Name is required`),
	},
	equipmentType: {
		type: "text",
		label: t`Type`,
		placeholder: t`e.g. HVAC, Pump`,
		validator: z.string().min(1, t`Type is required`),
	},
	siteId: {
		type: "select",
		label: t`Site`,
		options: siteOptions.length > 0 ? siteOptions : [{ label: t`No sites available`, value: "" }],
		validator: z.string().min(1, t`Site is required`),
	},
});

export function EquipmentForm({
	siteOptions,
	defaultValues,
	onSubmit,
	submitLabel,
	isSubmitting = false,
}: EquipmentFormProps) {
	const schema = getEquipmentFormSchema(siteOptions);

	return (
		<Form
			formId="equipment-form"
			schema={() => schema}
			defaultValues={defaultValues}
			onSubmit={(values) =>
				onSubmit({
					name: values.name as string,
					equipmentType: values.equipmentType as string,
					siteId: values.siteId as string,
				})
			}
			submitLabel={submitLabel ?? t`Save Equipment`}
			isSubmitting={isSubmitting}
		/>
	);
}

export function equipmentFormValuesFromResponse(equipment: {
	name?: string | null;
	equipmentType?: string | null;
	siteId?: string;
}): { name: string; equipmentType: string; siteId: string } {
	return {
		name: equipment.name ?? "",
		equipmentType: equipment.equipmentType ?? "",
		siteId: equipment.siteId ?? "",
	};
}
