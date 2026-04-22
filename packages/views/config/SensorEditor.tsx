import { ArrowRight, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";

import { t } from "~@/i18n/macro";
import {
	Button,
	Card,
	CardContent,
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
	Switch,
	Textarea,
} from "~@/ui";

import type {
	DataMapping,
	DataMappingTransformType,
	Equipment,
	Sensor,
	SensorType,
	SensorTypeOption,
	Site,
	TransformTypeOption,
} from "./types";

interface SensorEditorProps {
	sensor: Sensor | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (sensor: Sensor) => void;
	sites: Site[];
	equipment: Equipment[];
	sensorTypeOptions: SensorTypeOption[];
	transformTypeOptions: TransformTypeOption[];
	getEquipmentBySite: (siteId: string) => Equipment[];
	getUnitForSensorType: (type: SensorType) => string;
}

interface DataMappingState {
	id: string;
	incomingField: string;
	mapsTo: SensorType;
	unitOverride: string;
	transformType: DataMappingTransformType;
	transformValue: string;
}

const createEmptyMapping = (defaultType: SensorType): DataMappingState => ({
	id: `mapping-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
	incomingField: "",
	mapsTo: defaultType,
	unitOverride: "",
	transformType: "none",
	transformValue: "",
});

export function SensorEditor({
	sensor,
	open,
	onOpenChange,
	onSave,
	sites,
	sensorTypeOptions,
	transformTypeOptions,
	getEquipmentBySite,
	getUnitForSensorType,
}: SensorEditorProps) {
	// Form state
	const [id, setId] = useState("");
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [type, setType] = useState<SensorType>("temperature");
	const [unit, setUnit] = useState("°C");
	const [siteId, setSiteId] = useState("");
	const [equipmentId, setEquipmentId] = useState("");
	const [physicalLocation, setPhysicalLocation] = useState("");
	const [isActive, setIsActive] = useState(true);
	const [dataMappings, setDataMappings] = useState<DataMappingState[]>([]);

	// Derived state
	const availableEquipment = getEquipmentBySite(siteId);
	const isEditing = !!sensor;

	// Initialize form when sensor changes
	useEffect(() => {
		if (sensor) {
			setId(sensor.id);
			setName(sensor.name);
			setDescription(sensor.description || "");
			setType(sensor.type);
			setUnit(sensor.unit);
			setSiteId(sensor.siteId);
			setEquipmentId(sensor.equipmentId || "");
			setPhysicalLocation(sensor.physicalLocation || "");
			setIsActive(sensor.status === "active");
			setDataMappings(
				sensor.dataMapping?.map((m) => ({
					id: m.id,
					incomingField: m.incomingField,
					mapsTo: m.mapsTo,
					unitOverride: m.unitOverride || "",
					transformType: m.transform?.type || "none",
					transformValue:
						m.transform?.type === "scale"
							? String(m.transform.factor || "")
							: m.transform?.type === "offset"
								? String(m.transform.offset || "")
								: "",
				})) || [],
			);
		} else {
			setId(`sensor-${Date.now()}`);
			setName("");
			setDescription("");
			setType("temperature");
			setUnit("°C");
			setSiteId("");
			setEquipmentId("");
			setPhysicalLocation("");
			setIsActive(true);
			setDataMappings([]);
		}
	}, [sensor, open]);

	// Update unit when type changes
	useEffect(() => {
		setUnit(getUnitForSensorType(type));
	}, [type, getUnitForSensorType]);

	// Clear equipment when site changes
	useEffect(() => {
		if (siteId && equipmentId) {
			const validEquipment = availableEquipment.find((eq) => eq.id === equipmentId);
			if (!validEquipment) {
				setEquipmentId("");
			}
		}
	}, [siteId, equipmentId, availableEquipment]);

	const addDataMapping = () => {
		setDataMappings([...dataMappings, createEmptyMapping(type)]);
	};

	const removeDataMapping = (mappingId: string) => {
		setDataMappings(dataMappings.filter((m) => m.id !== mappingId));
	};

	const updateDataMapping = (mappingId: string, field: keyof DataMappingState, value: string) => {
		setDataMappings(dataMappings.map((m) => (m.id === mappingId ? { ...m, [field]: value } : m)));
	};

	const handleSubmit = () => {
		if (!name.trim() || !siteId) return;

		const mappings: DataMapping[] | undefined =
			dataMappings.length > 0
				? dataMappings
						.filter((m) => m.incomingField.trim())
						.map((m) => ({
							id: m.id,
							incomingField: m.incomingField,
							mapsTo: m.mapsTo,
							unitOverride: m.unitOverride || undefined,
							transform:
								m.transformType !== "none"
									? {
											type: m.transformType,
											factor:
												m.transformType === "scale"
													? Number(m.transformValue) || undefined
													: undefined,
											offset:
												m.transformType === "offset"
													? Number(m.transformValue) || undefined
													: undefined,
										}
									: undefined,
						}))
				: undefined;

		const newSensor: Sensor = {
			...sensor,
			id,
			name,
			description: description || undefined,
			type,
			unit,
			siteId,
			equipmentId: equipmentId || undefined,
			physicalLocation: physicalLocation || undefined,
			status: isActive ? "active" : "inactive",
			dataMapping: mappings,
		};

		onSave(newSensor);
	};

	const isFormValid = name.trim() && siteId;

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{isEditing ? t`Edit Sensor` : t`Register Sensor`}</DialogTitle>
					<DialogDescription>
						{t`Configure sensor identification, measurement, installation context, and data mapping.`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">{t`Basic Information`}</h3>

						<div>
							<label htmlFor="sensor-id" className="text-sm font-medium mb-1.5 block">
								{t`Sensor ID`} <span className="text-destructive">*</span>
							</label>
							<Input
								id="sensor-id"
								value={id}
								onChange={(e) => setId(e.target.value)}
								disabled={isEditing}
								placeholder={t`e.g., sensor-001`}
							/>
							<p className="text-xs text-muted-foreground mt-1">
								{isEditing
									? t`Sensor ID cannot be changed after creation`
									: t`Unique identifier for this sensor`}
							</p>
						</div>

						<div>
							<label htmlFor="sensor-name" className="text-sm font-medium mb-1.5 block">
								{t`Display Name`} <span className="text-destructive">*</span>
							</label>
							<Input
								id="sensor-name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								placeholder={t`e.g., Main Temperature Sensor`}
							/>
						</div>

						<div>
							<label htmlFor="sensor-description" className="text-sm font-medium mb-1.5 block">
								{t`Description`}
							</label>
							<Textarea
								id="sensor-description"
								value={description}
								onChange={(e) => setDescription(e.target.value)}
								placeholder={t`Optional description or notes`}
								rows={2}
							/>
						</div>
					</div>

					<Separator />

					{/* Measurement */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">{t`Measurement`}</h3>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label htmlFor="sensor-type" className="text-sm font-medium mb-1.5 block">
									{t`Sensor Type`} <span className="text-destructive">*</span>
								</label>
								<Select value={type} onValueChange={(v) => setType(v as SensorType)}>
									<SelectTrigger id="sensor-type">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										{sensorTypeOptions.map((option) => (
											<SelectItem key={option.value} value={option.value}>
												{option.label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div>
								<label htmlFor="sensor-unit" className="text-sm font-medium mb-1.5 block">
									{t`Unit`} <span className="text-destructive">*</span>
								</label>
								<Input id="sensor-unit" value={unit} onChange={(e) => setUnit(e.target.value)} />
								<p className="text-xs text-muted-foreground mt-1">
									{t`Auto-populated based on sensor type`}
								</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* Installation Context */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">{t`Installation Context`}</h3>

						<div>
							<label htmlFor="sensor-site" className="text-sm font-medium mb-1.5 block">
								{t`Site`} <span className="text-destructive">*</span>
							</label>
							<Select value={siteId} onValueChange={setSiteId}>
								<SelectTrigger id="sensor-site">
									<SelectValue placeholder={t`Select a site`} />
								</SelectTrigger>
								<SelectContent>
									{sites.map((site) => (
										<SelectItem key={site.id} value={site.id}>
											{site.name} ({site.location})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div>
							<label htmlFor="sensor-equipment" className="text-sm font-medium mb-1.5 block">
								{t`Equipment`}
							</label>
							<Select
								value={equipmentId || "__unassigned__"}
								onValueChange={(v) => setEquipmentId(v === "__unassigned__" ? "" : v)}
								disabled={!siteId}
							>
								<SelectTrigger id="sensor-equipment">
									<SelectValue placeholder={t`Select equipment (optional)`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="__unassigned__">{t`Unassigned`}</SelectItem>
									{availableEquipment.map((eq) => (
										<SelectItem key={eq.id} value={eq.id}>
											{eq.name} ({eq.type})
										</SelectItem>
									))}
								</SelectContent>
							</Select>
							<p className="text-xs text-muted-foreground mt-1">
								{t`Optional: Assign sensor to specific equipment`}
							</p>
						</div>

						<div>
							<label htmlFor="sensor-location" className="text-sm font-medium mb-1.5 block">
								{t`Physical Location`}
							</label>
							<Input
								id="sensor-location"
								value={physicalLocation}
								onChange={(e) => setPhysicalLocation(e.target.value)}
								placeholder={t`e.g., North wall, bay 3`}
							/>
						</div>
					</div>

					<Separator />

					{/* Status Toggle */}
					<div className="flex items-center justify-between rounded-lg border p-4">
						<div>
							<p className="text-sm font-medium">{t`Status`}</p>
							<p className="text-xs text-muted-foreground">
								{t`Active sensors will receive and process data`}
							</p>
						</div>
						<Switch
							checked={isActive}
							onCheckedChange={setIsActive}
							aria-label={t`Toggle sensor active status`}
						/>
					</div>

					<Separator />

					{/* Data Field Mapping */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<h3 className="text-sm font-semibold">{t`Data Field Mapping`}</h3>
								<p className="text-xs text-muted-foreground mt-0.5">
									{t`Map incoming payload fields to sensor types`}
								</p>
							</div>
							<Button type="button" variant="outline" size="sm" onClick={addDataMapping}>
								<Plus className="h-4 w-4 mr-1.5" />
								{t`Add Mapping`}
							</Button>
						</div>

						{dataMappings.length === 0 ? (
							<Card>
								<CardContent className="py-6 text-center">
									<p className="text-sm text-muted-foreground mb-2">{t`No data mappings configured`}</p>
									<p className="text-xs text-muted-foreground">
										{isActive
											? t`Active sensors should have at least one mapping. Add a mapping to receive data.`
											: t`Add mappings to configure how incoming data is processed`}
									</p>
								</CardContent>
							</Card>
						) : (
							<div className="space-y-3">
								{dataMappings.map((mapping, index) => (
									<Card key={mapping.id}>
										<CardContent className="p-4 space-y-3">
											<div className="flex items-center justify-between">
												<h4 className="text-sm font-medium">{t`Mapping ${index + 1}`}</h4>
												<Button
													type="button"
													variant="ghost"
													size="sm"
													onClick={() => removeDataMapping(mapping.id)}
													className="h-7 w-7 p-0"
													aria-label={t`Remove mapping ${index + 1}`}
												>
													<X className="h-4 w-4" />
												</Button>
											</div>

											<div className="grid grid-cols-2 gap-3">
												<div>
													<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
														{t`Incoming Field Name`} <span className="text-destructive">*</span>
													</label>
													<Input
														value={mapping.incomingField}
														onChange={(e) =>
															updateDataMapping(mapping.id, "incomingField", e.target.value)
														}
														placeholder={t`e.g., temp_value`}
													/>
												</div>
												<div className="flex items-center gap-2">
													<ArrowRight className="size-4 text-muted-foreground mt-5 shrink-0" />
													<div className="flex-1">
														<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
															{t`Maps To`} <span className="text-destructive">*</span>
														</label>
														<Select
															value={mapping.mapsTo}
															onValueChange={(v) => updateDataMapping(mapping.id, "mapsTo", v)}
														>
															<SelectTrigger>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																{sensorTypeOptions.map((option) => (
																	<SelectItem key={option.value} value={option.value}>
																		{option.label}
																	</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>
											</div>

											<div>
												<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
													{t`Unit Override (Optional)`}
												</label>
												<Input
													value={mapping.unitOverride}
													onChange={(e) =>
														updateDataMapping(mapping.id, "unitOverride", e.target.value)
													}
													placeholder={t`Leave empty to use default`}
												/>
											</div>

											<div className="space-y-2">
												<label className="text-xs font-medium text-muted-foreground block">
													{t`Transform (Optional)`}
												</label>
												<Select
													value={mapping.transformType}
													onValueChange={(v) => updateDataMapping(mapping.id, "transformType", v)}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{transformTypeOptions.map((option) => (
															<SelectItem key={option.value} value={option.value}>
																{option.label}
															</SelectItem>
														))}
													</SelectContent>
												</Select>

												{mapping.transformType === "scale" && (
													<Input
														type="number"
														placeholder={t`Factor (e.g., 1.8)`}
														value={mapping.transformValue}
														onChange={(e) =>
															updateDataMapping(mapping.id, "transformValue", e.target.value)
														}
													/>
												)}
												{mapping.transformType === "offset" && (
													<Input
														type="number"
														placeholder={t`Offset (e.g., 32)`}
														value={mapping.transformValue}
														onChange={(e) =>
															updateDataMapping(mapping.id, "transformValue", e.target.value)
														}
													/>
												)}
											</div>
										</CardContent>
									</Card>
								))}
							</div>
						)}

						{isActive && dataMappings.length === 0 && (
							<div className="p-3 rounded-lg border border-amber-200 bg-amber-50">
								<p className="text-xs text-amber-700">
									{t`⚠️ Active sensor without data mapping. Add at least one mapping to receive data.`}
								</p>
							</div>
						)}
					</div>
				</div>

				<DialogFooter>
					<DialogClose asChild>
						<Button type="button" variant="outline">
							{t`Cancel`}
						</Button>
					</DialogClose>
					<Button onClick={handleSubmit} disabled={!isFormValid}>
						{isEditing ? t`Update Sensor` : t`Register Sensor`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
