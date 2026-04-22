import { z } from "zod";

import type { SensorRequest } from "~@/api";
import { SensorStatus } from "~@/api";
import type { FormSchema } from "~@/forms";
import { Form } from "~@/forms";
import { t } from "~@/i18n/macro";

const STATUS_OPTIONS = [
	{ label: t`Active`, value: String(SensorStatus._0) },
	{ label: t`Inactive`, value: String(SensorStatus._1) },
	{ label: t`Maintenance`, value: String(SensorStatus._2) },
	{ label: t`Offline`, value: String(SensorStatus._3) },
];

/** Payload when creating a sensor with a new threshold (avoids unique constraint on sensors.threshold_id). */
export type CreateSensorWithNewThresholdRequest = Omit<SensorRequest, "thresholdId"> & {
	thresholdMin: number;
	thresholdMax: number;
	thresholdDurationSeconds: number;
};

export interface SensorFormProps {
	equipmentOptions: Array<{ label: string; value: string }>;
	sensorTypeOptions: Array<{ label: string; value: string }>;
	thresholdOptions: Array<{ label: string; value: string }>;
	/** When true, show threshold min/max/duration fields and create a new threshold on submit (avoids duplicate threshold_id). */
	createNewThreshold?: boolean;
	defaultValues?: Partial<
		{
			serial: string;
			status: SensorStatus;
			equipmentId: string;
			sensorTypeId: string;
			thresholdId: string;
		} & Partial<CreateSensorWithNewThresholdRequest>
	>;
	onSubmit: (data: SensorRequest | CreateSensorWithNewThresholdRequest) => void | Promise<void>;
	submitLabel?: string;
	isSubmitting?: boolean;
}

const getSensorFormSchema = (
	equipmentOptions: Array<{ label: string; value: string }>,
	sensorTypeOptions: Array<{ label: string; value: string }>,
	thresholdOptions: Array<{ label: string; value: string }>,
	createNewThreshold: boolean,
): FormSchema => {
	const base: FormSchema = {
		serial: {
			type: "text",
			label: t`Serial`,
			placeholder: t`Sensor serial number`,
			validator: z.string().min(1, t`Serial is required`),
		},
		status: {
			type: "select",
			label: t`Status`,
			options: STATUS_OPTIONS,
			validator: z.number().or(z.string().transform(Number)),
		},
		equipmentId: {
			type: "select",
			label: t`Equipment`,
			options:
				equipmentOptions.length > 0
					? equipmentOptions
					: [{ label: t`No equipment available`, value: "" }],
			validator: z.string().min(1, t`Equipment is required`),
		},
		sensorTypeId: {
			type: "select",
			label: t`Sensor Type`,
			options:
				sensorTypeOptions.length > 0
					? sensorTypeOptions
					: [{ label: t`No types available`, value: "" }],
			validator: z.string().min(1, t`Sensor type is required`),
		},
	};

	if (createNewThreshold) {
		return {
			...base,
			thresholdMin: {
				type: "text",
				inputType: "number",
				label: t`Threshold min`,
				placeholder: t`Min value`,
				validator: z.coerce.number(),
			},
			thresholdMax: {
				type: "text",
				inputType: "number",
				label: t`Threshold max`,
				placeholder: t`Max value`,
				validator: z.coerce.number(),
			},
			thresholdDurationSeconds: {
				type: "text",
				inputType: "number",
				label: t`Threshold duration (seconds)`,
				placeholder: t`Duration in seconds`,
				validator: z.coerce.number().int().min(0),
			},
		};
	}

	return {
		...base,
		thresholdId: {
			type: "select",
			label: t`Threshold`,
			options:
				thresholdOptions.length > 0
					? thresholdOptions
					: [{ label: t`No thresholds available`, value: "" }],
			validator: z.string().min(1, t`Threshold is required`),
		},
	};
};

const DEFAULT_THRESHOLD_MIN = 0;
const DEFAULT_THRESHOLD_MAX = 100;
const DEFAULT_THRESHOLD_DURATION_SECONDS = 60;

export function SensorForm({
	equipmentOptions,
	sensorTypeOptions,
	thresholdOptions,
	createNewThreshold = false,
	defaultValues,
	onSubmit,
	submitLabel,
	isSubmitting = false,
}: SensorFormProps) {
	const schema = getSensorFormSchema(
		equipmentOptions,
		sensorTypeOptions,
		thresholdOptions,
		createNewThreshold,
	);

	const defaultFormValues = defaultValues
		? {
				serial: defaultValues.serial ?? "",
				status: defaultValues.status !== undefined ? String(defaultValues.status) : "",
				equipmentId: defaultValues.equipmentId ?? "",
				sensorTypeId: defaultValues.sensorTypeId ?? "",
				...(createNewThreshold
					? {
							thresholdMin: defaultValues.thresholdMin ?? DEFAULT_THRESHOLD_MIN,
							thresholdMax: defaultValues.thresholdMax ?? DEFAULT_THRESHOLD_MAX,
							thresholdDurationSeconds:
								defaultValues.thresholdDurationSeconds ?? DEFAULT_THRESHOLD_DURATION_SECONDS,
						}
					: { thresholdId: defaultValues.thresholdId ?? "" }),
			}
		: undefined;

	return (
		<Form
			formId="sensor-form"
			schema={() => schema}
			defaultValues={defaultFormValues}
			onSubmit={(values) => {
				if (createNewThreshold) {
					onSubmit({
						serial: values.serial as string,
						status: Number(values.status) as SensorStatus,
						equipmentId: values.equipmentId as string,
						sensorTypeId: values.sensorTypeId as string,
						thresholdMin: Number(values.thresholdMin),
						thresholdMax: Number(values.thresholdMax),
						thresholdDurationSeconds: Number(values.thresholdDurationSeconds),
					});
				} else {
					onSubmit({
						serial: values.serial as string,
						status: Number(values.status) as SensorStatus,
						equipmentId: values.equipmentId as string,
						sensorTypeId: values.sensorTypeId as string,
						thresholdId: values.thresholdId as string,
					});
				}
			}}
			submitLabel={submitLabel ?? t`Save Sensor`}
			isSubmitting={isSubmitting}
		/>
	);
}

export function sensorFormValuesFromResponse(sensor: {
	serial?: string | null;
	status?: SensorStatus;
	equipmentId?: string;
	sensorTypeId?: string;
	thresholdId?: string;
}): {
	serial: string;
	status: SensorStatus;
	equipmentId: string;
	sensorTypeId: string;
	thresholdId: string;
} {
	return {
		serial: sensor.serial ?? "",
		status: sensor.status ?? SensorStatus._0,
		equipmentId: sensor.equipmentId ?? "",
		sensorTypeId: sensor.sensorTypeId ?? "",
		thresholdId: sensor.thresholdId ?? "",
	};
}
