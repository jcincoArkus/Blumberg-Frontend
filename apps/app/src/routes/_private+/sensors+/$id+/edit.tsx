import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import { getAllEquipmentV1, getAllSensorTypesV1, getAllThresholdsV1 } from "~@/api";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useSensorViewModel } from "~@/view-model";
import { getSensorTypeKindDisplayName, SensorForm, sensorFormValuesFromResponse } from "~@/views";

export default observer(function EditSensorPage() {
	const { id } = useParams();
	const navigate = useNavigate();
	const vm = useSensorViewModel();
	const [equipmentOptions, setEquipmentOptions] = useState<Array<{ label: string; value: string }>>(
		[],
	);
	const [sensorTypeOptions, setSensorTypeOptions] = useState<
		Array<{ label: string; value: string }>
	>([]);
	const [thresholdOptions, setThresholdOptions] = useState<Array<{ label: string; value: string }>>(
		[],
	);

	useEffect(() => {
		if (id) vm.loadSensor(id);
	}, [id, vm]);

	useEffect(() => {
		Promise.all([
			getAllEquipmentV1({ query: { Page: 1, PageSize: 500 } }),
			getAllSensorTypesV1({ query: { Page: 1, PageSize: 100 } }),
			getAllThresholdsV1({ query: { Page: 1, PageSize: 100 } }),
		])
			.then(([equipmentRes, typesRes, thresholdsRes]) => {
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
				const threshItems = thresholdsRes.data?.items ?? [];
				setThresholdOptions(
					threshItems
						.map((th) => ({ label: `min: ${th.min} max: ${th.max}`, value: th.id ?? "" }))
						.filter((o) => o.value),
				);
			})
			.catch(() => {});
	}, []);

	const handleSubmit = async (data: Parameters<typeof vm.updateSensor>[1]) => {
		if (!id) return;
		try {
			const sensor = await vm.updateSensor(id, data);
			if (sensor?.id) {
				toast.success(t`Sensor updated successfully`);
				navigate(`/sensors/${id}`, { replace: true });
			} else {
				toast.error(t`Failed to update sensor`);
			}
		} catch {
			toast.error(vm.error?.message ?? t`Failed to update sensor`);
		}
	};

	if (vm.isLoading && !vm.sensor) {
		return (
			<div className="flex items-center justify-center min-h-[200px]">
				<p className="text-muted-foreground">{t`Loading...`}</p>
			</div>
		);
	}

	if (vm.hasError || !vm.sensor) {
		return (
			<div className="space-y-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/sensors">
						<ArrowLeft className="size-4 mr-2" />
						{t`Back to Sensors`}
					</Link>
				</Button>
				<p className="text-destructive">{vm.error?.message ?? t`Sensor not found`}</p>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to={`/sensors/${id}`}>
						<ArrowLeft className="size-4 mr-2" />
						{t`Back to Sensor`}
					</Link>
				</Button>
			</div>
			<Card>
				<CardHeader>
					<CardTitle>{t`Edit Sensor`}</CardTitle>
				</CardHeader>
				<CardContent>
					<SensorForm
						equipmentOptions={equipmentOptions}
						sensorTypeOptions={sensorTypeOptions}
						thresholdOptions={thresholdOptions}
						defaultValues={sensorFormValuesFromResponse(vm.sensor)}
						onSubmit={handleSubmit}
						submitLabel={t`Update Sensor`}
						isSubmitting={vm.isSaving}
					/>
				</CardContent>
			</Card>
		</div>
	);
});
