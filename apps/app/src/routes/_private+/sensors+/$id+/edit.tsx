import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { toast } from "sonner";

import type { SensorRequest, ThresholdResponse } from "~@/api";
import {
	createThresholdV1,
	getAllEquipmentV1,
	getAllSensorTypesV1,
	getThresholdByIdV1,
} from "~@/api";
import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { useSensorViewModel } from "~@/view-model";
import type { CreateSensorWithNewThresholdRequest } from "~@/views";
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
	const [currentThreshold, setCurrentThreshold] = useState<ThresholdResponse | null>(null);

	useEffect(() => {
		if (id) vm.loadSensor(id);
	}, [id, vm]);

	// Fetch the current threshold once the sensor is loaded
	useEffect(() => {
		const thresholdId = vm.sensor?.thresholdId;
		if (thresholdId) {
			getThresholdByIdV1({ path: { id: thresholdId } })
				.then((res) => setCurrentThreshold(res.data ?? null))
				.catch(() => setCurrentThreshold(null));
		}
	}, [vm.sensor?.thresholdId]);

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

	const handleSubmit = async (data: SensorRequest | CreateSensorWithNewThresholdRequest) => {
		if (!id) return;
		try {
			let updateData: Parameters<typeof vm.updateSensor>[1];
			if ("thresholdMin" in data && "thresholdMax" in data && "thresholdDurationSeconds" in data) {
				const { thresholdMin, thresholdMax, thresholdDurationSeconds, ...rest } = data;
				const { data: newThreshold } = await createThresholdV1({
					body: {
						min: Number(thresholdMin),
						max: Number(thresholdMax),
						durationSeconds: Number(thresholdDurationSeconds),
					},
				});
				if (!newThreshold?.id) {
					toast.error(t`Failed to create threshold`);
					return;
				}
				updateData = {
					serial: rest.serial as string,
					status: Number(rest.status),
					equipmentId: rest.equipmentId as string,
					sensorTypeId: rest.sensorTypeId as string,
					thresholdId: newThreshold.id,
				};
			} else {
				updateData = {
					serial: data.serial as string,
					status: Number(data.status),
					equipmentId: data.equipmentId as string,
					sensorTypeId: data.sensorTypeId as string,
					thresholdId: data.thresholdId as string,
				};
			}
			const sensor = await vm.updateSensor(id, updateData);
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
			{currentThreshold && (
				<Card className="border-muted">
					<CardHeader className="pb-2">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm">{t`Current Threshold`}</CardTitle>
							<Badge variant="outline">{t`Active`}</Badge>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-3 gap-4 text-sm">
							<div>
								<p className="text-muted-foreground text-xs mb-1">{t`Min`}</p>
								<p className="font-medium">{currentThreshold.min}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs mb-1">{t`Max`}</p>
								<p className="font-medium">{currentThreshold.max}</p>
							</div>
							<div>
								<p className="text-muted-foreground text-xs mb-1">{t`Duration`}</p>
								<p className="font-medium">{currentThreshold.durationSeconds}s</p>
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			<Card>
				<CardHeader>
					<CardTitle>{t`Edit Sensor`}</CardTitle>
				</CardHeader>
				<CardContent>
					{!vm.sensor?.thresholdId ? (
						<p className="text-sm text-muted-foreground">{t`Loading threshold...`}</p>
					) : currentThreshold ? (
						<SensorForm
							key={currentThreshold.id}
							equipmentOptions={equipmentOptions}
							sensorTypeOptions={sensorTypeOptions}
							thresholdOptions={[]}
							createNewThreshold
							defaultValues={{
								...sensorFormValuesFromResponse(vm.sensor),
								thresholdMin: currentThreshold.min ?? 0,
								thresholdMax: currentThreshold.max ?? 100,
								thresholdDurationSeconds: currentThreshold.durationSeconds ?? 60,
							}}
							onSubmit={handleSubmit}
							submitLabel={t`Update Sensor`}
							isSubmitting={vm.isSaving}
						/>
					) : (
						<p className="text-sm text-muted-foreground">{t`Loading threshold...`}</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
});
