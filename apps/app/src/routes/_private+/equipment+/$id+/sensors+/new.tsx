import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { createThresholdV1, getAllEquipmentV1, getAllSensorTypesV1 } from "~@/api";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useSensorViewModel } from "~@/view-model";
import { getSensorTypeKindDisplayName, SensorForm } from "~@/views";

export default observer(function NewEquipmentSensorPage() {
	const { id: equipmentId } = useParams();
	const navigate = useNavigate();
	const vm = useSensorViewModel();
	const [equipmentOptions, setEquipmentOptions] = useState<Array<{ label: string; value: string }>>(
		[],
	);
	const [sensorTypeOptions, setSensorTypeOptions] = useState<
		Array<{ label: string; value: string }>
	>([]);
	useEffect(() => {
		Promise.all([
			getAllEquipmentV1({ query: { Page: 1, PageSize: 500 } }),
			getAllSensorTypesV1({ query: { Page: 1, PageSize: 100 } }),
		])
			.then(([equipmentRes, typesRes]) => {
				const eqItems = equipmentRes.data?.items ?? [];
				setEquipmentOptions(
					eqItems
						.map((e) => ({ label: e.name ?? e.id ?? "", value: e.id ?? "" }))
						.filter((o) => o.value),
				);
				const typeItems = typesRes.data?.items ?? [];
				setSensorTypeOptions(
					typeItems
						.map((st) => ({
							label: (getSensorTypeKindDisplayName(st.type) || st.id) ?? "",
							value: st.id ?? "",
						}))
						.filter((o) => o.value),
				);
			})
			.catch(() => {});
	}, []);

	const handleSubmit = async (
		data: Parameters<typeof vm.createSensor>[0] & {
			thresholdMin?: number;
			thresholdMax?: number;
			thresholdDurationSeconds?: number;
		},
	) => {
		try {
			const basePayload = equipmentId ? { ...data, equipmentId } : data;
			let sensor;
			if (
				"thresholdMin" in basePayload &&
				"thresholdMax" in basePayload &&
				"thresholdDurationSeconds" in basePayload
			) {
				const { thresholdMin, thresholdMax, thresholdDurationSeconds, ...rest } = basePayload;
				const { data: newThreshold } = await createThresholdV1({
					body: {
						min: thresholdMin,
						max: thresholdMax,
						durationSeconds: thresholdDurationSeconds,
					},
				});
				if (!newThreshold?.id) {
					toast.error(t`Failed to create threshold`);
					return;
				}
				sensor = await vm.createSensor({
					...rest,
					thresholdId: newThreshold.id,
				});
			} else {
				sensor = await vm.createSensor(basePayload);
			}
			if (sensor?.id) {
				toast.success(t`Sensor created successfully`);
				navigate(`/sensors/${sensor.id}`, { replace: true });
			} else {
				toast.error(t`Failed to create sensor`);
			}
		} catch {
			toast.error(vm.error?.message ?? t`Failed to create sensor`);
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to={equipmentId ? `/equipment/${equipmentId}/sensors` : "/sensors"}>
						<ArrowLeft className="size-4 mr-2" />
						{t`Back`}
					</Link>
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>{t`New Sensor`}</CardTitle>
				</CardHeader>
				<CardContent>
					<SensorForm
						equipmentOptions={equipmentOptions}
						sensorTypeOptions={sensorTypeOptions}
						thresholdOptions={[]}
						createNewThreshold
						defaultValues={
							equipmentId
								? {
										equipmentId,
										serial: "",
										status: 0,
										sensorTypeId: "",
									}
								: undefined
						}
						onSubmit={handleSubmit}
						submitLabel={t`Create Sensor`}
						isSubmitting={vm.isSaving}
					/>
				</CardContent>
			</Card>
		</div>
	);
});
