import { z } from "zod";

import type { SiteRequest } from "~@/api";
import type { FormSchema } from "~@/forms";
import { Form } from "~@/forms";
import { t } from "~@/i18n/macro";

const getSiteFormSchema = (): FormSchema => ({
	name: {
		type: "text",
		label: t`Name`,
		placeholder: t`Site name`,
		validator: z.string().min(1, t`Name is required`),
	},
	address: {
		type: "text",
		label: t`Address`,
		placeholder: t`Street address`,
		validator: z.string().min(1, t`Address is required`),
	},
	city: {
		type: "text",
		label: t`City`,
		placeholder: t`City`,
		validator: z.string().min(1, t`City is required`),
	},
	state: {
		type: "text",
		label: t`State / Region`,
		placeholder: t`State or region`,
		validator: z.string().min(1, t`State is required`),
	},
	postalCode: {
		type: "text",
		label: t`Postal Code`,
		placeholder: t`Postal code`,
		validator: z.string().min(1, t`Postal code is required`),
	},
	country: {
		type: "text",
		label: t`Country`,
		placeholder: t`Country`,
		validator: z.string().min(1, t`Country is required`),
	},
});

type SiteFormValues = {
	name: string;
	address: string;
	city: string;
	state: string;
	postalCode: string;
	country: string;
};

function toRequest(values: SiteFormValues): SiteRequest {
	return {
		name: values.name,
		address: values.address,
		city: values.city,
		state: values.state,
		postalCode: values.postalCode,
		country: values.country,
	};
}

export interface SiteFormProps {
	defaultValues?: Partial<SiteFormValues>;
	onSubmit: (data: SiteRequest) => void | Promise<void>;
	submitLabel?: string;
	isSubmitting?: boolean;
}

export function SiteForm({
	defaultValues,
	onSubmit,
	submitLabel,
	isSubmitting = false,
}: SiteFormProps) {
	const handleSubmit = (values: SiteFormValues) => {
		return onSubmit(toRequest(values));
	};

	return (
		<Form
			formId="site-form"
			schema={getSiteFormSchema}
			defaultValues={defaultValues}
			onSubmit={handleSubmit}
			submitLabel={submitLabel ?? t`Save Site`}
			isSubmitting={isSubmitting}
		/>
	);
}

export function siteFormValuesFromResponse(site: {
	name?: string | null;
	address?: string | null;
	city?: string | null;
	state?: string | null;
	postalCode?: string | null;
	country?: string | null;
}): SiteFormValues {
	return {
		name: site.name ?? "",
		address: site.address ?? "",
		city: site.city ?? "",
		state: site.state ?? "",
		postalCode: site.postalCode ?? "",
		country: site.country ?? "",
	};
}
