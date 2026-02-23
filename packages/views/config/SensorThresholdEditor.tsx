import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";

import { t } from "~@/i18n/macro";
import {
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Dialog,
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
} from "~@/ui";

import type { Sensor, SensorThreshold, SensorThresholdSeverity } from "./types";

interface SensorThresholdEditorProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	threshold: SensorThreshold | null;
	onSave: (threshold: SensorThreshold) => void;
	sensors: Sensor[];
	severityOptions: { value: SensorThresholdSeverity; label: string }[];
	timeOptions: { value: number; label: string }[];
	/** Pre-select and lock to a specific sensor (used when opening from sensor row) */
	sensorId?: string;
}

export function SensorThresholdEditor({
	open,
	onOpenChange,
	threshold,
	onSave,
	sensors,
	severityOptions,
	timeOptions,
	sensorId: preSelectedSensorId,
}: SensorThresholdEditorProps) {
	const [sensorId, setSensorId] = useState("");
	const [min, setMin] = useState("");
	const [max, setMax] = useState("");
	const [unit, setUnit] = useState("");
	const [minOutOfRangeSeconds, setMinOutOfRangeSeconds] = useState(120);
	const [severity, setSeverity] = useState<SensorThresholdSeverity>("medium");
	const [errors, setErrors] = useState<Record<string, string>>({});

	const isEditing = !!threshold;
	const isSensorLocked = isEditing || !!preSelectedSensorId;
	const selectedSensor = sensors.find((s) => s.id === sensorId);

	// Initialize form when threshold changes
	useEffect(() => {
		if (threshold) {
			setSensorId(threshold.sensorId);
			setMin(threshold.min.toString());
			setMax(threshold.max.toString());
			setUnit(threshold.unit);
			setMinOutOfRangeSeconds(threshold.minOutOfRangeSeconds);
			setSeverity(threshold.severity);
		} else {
			setSensorId(preSelectedSensorId || "");
			setMin("");
			setMax("");
			setUnit("");
			setMinOutOfRangeSeconds(120);
			setSeverity("medium");
		}
		setErrors({});
	}, [threshold, open, preSelectedSensorId]);

	// Update unit when sensor changes
	useEffect(() => {
		if (selectedSensor) {
			setUnit(selectedSensor.unit);
		}
	}, [selectedSensor]);

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!sensorId) {
			newErrors.sensorId = t`A sensor must be selected`;
		}

		if (!min) {
			newErrors.min = t`Min value is required`;
		}

		if (!max) {
			newErrors.max = t`Max value is required`;
		}

		if (min && max) {
			const minVal = parseFloat(min);
			const maxVal = parseFloat(max);
			if (minVal >= maxVal) {
				newErrors.thresholds = t`Min must be less than max`;
			}
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validate()) return;

		const newThreshold: SensorThreshold = {
			id: threshold?.id || `threshold-${Date.now()}`,
			sensorId,
			min: parseFloat(min),
			max: parseFloat(max),
			unit,
			minOutOfRangeSeconds,
			severity,
			createdAt: threshold?.createdAt || new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		onSave(newThreshold);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? t`Edit Sensor Threshold` : t`Create Sensor Threshold`}
					</DialogTitle>
					<DialogDescription>
						{t`Define the normal operating range for a specific sensor.`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Sensor Selection */}
					<div className="space-y-2">
						<label htmlFor="threshold-sensor" className="text-sm font-medium">
							{t`Sensor`} <span className="text-destructive">*</span>
						</label>
						<Select value={sensorId} onValueChange={setSensorId} disabled={isSensorLocked}>
							<SelectTrigger id="threshold-sensor">
								<SelectValue placeholder={t`Select a sensor`} />
							</SelectTrigger>
							<SelectContent>
								{sensors.map((sensor) => (
									<SelectItem key={sensor.id} value={sensor.id}>
										{sensor.name} ({sensor.id})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{isSensorLocked && (
							<p className="text-xs text-muted-foreground">
								{isEditing
									? t`Sensor cannot be changed after creation`
									: t`Threshold will be created for this sensor`}
							</p>
						)}
						{errors.sensorId && <p className="text-destructive text-sm">{errors.sensorId}</p>}
					</div>

					<Separator />

					{/* Min / Max Thresholds */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">
							{t`Thresholds`} <span className="text-destructive">*</span>
						</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="threshold-min" className="text-sm">
									{t`Min`} {unit && `(${unit})`}
								</label>
								<Input
									id="threshold-min"
									type="number"
									value={min}
									onChange={(e) => setMin(e.target.value)}
									placeholder={t`Min value`}
								/>
								{errors.min && <p className="text-destructive text-sm">{errors.min}</p>}
							</div>
							<div className="space-y-2">
								<label htmlFor="threshold-max" className="text-sm">
									{t`Max`} {unit && `(${unit})`}
								</label>
								<Input
									id="threshold-max"
									type="number"
									value={max}
									onChange={(e) => setMax(e.target.value)}
									placeholder={t`Max value`}
								/>
								{errors.max && <p className="text-destructive text-sm">{errors.max}</p>}
							</div>
						</div>
						{errors.thresholds && <p className="text-destructive text-sm">{errors.thresholds}</p>}
					</div>

					<Separator />

					{/* Duration and Severity */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="threshold-duration" className="text-sm font-medium">
								{t`Time Out of Range`}
							</label>
							<Select
								value={minOutOfRangeSeconds.toString()}
								onValueChange={(value) => setMinOutOfRangeSeconds(parseInt(value, 10))}
							>
								<SelectTrigger id="threshold-duration">
									<SelectValue placeholder={t`Select time`} />
								</SelectTrigger>
								<SelectContent>
									{timeOptions.map((opt) => (
										<SelectItem key={opt.value} value={opt.value.toString()}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<label htmlFor="threshold-severity" className="text-sm font-medium">
								{t`Severity`}
							</label>
							<Select
								value={severity}
								onValueChange={(value: SensorThresholdSeverity) => setSeverity(value)}
							>
								<SelectTrigger id="threshold-severity">
									<SelectValue placeholder={t`Select severity`} />
								</SelectTrigger>
								<SelectContent>
									{severityOptions.map((opt) => (
										<SelectItem key={opt.value} value={opt.value}>
											{opt.label}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
					</div>

					<Separator />

					{/* Preview Card */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2 text-sm">
								<AlertTriangle className="h-4 w-4" />
								{t`Threshold Preview`}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">
								{selectedSensor
									? t`Sensor "${selectedSensor.name}" will trigger a`
									: t`Selected sensor will trigger a`}{" "}
								<span className="font-medium">{severity}</span> {t`alert when readings are outside`}{" "}
								{min && max ? `${min} – ${max} ${unit}` : t`the configured range`}{" "}
								{t`for more than`}{" "}
								{timeOptions.find((o) => o.value === minOutOfRangeSeconds)?.label || t`2 minutes`}.
							</p>
						</CardContent>
					</Card>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t`Cancel`}
					</Button>
					<Button onClick={handleSubmit}>
						{isEditing ? t`Save Changes` : t`Create Threshold`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
