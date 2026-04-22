import { AlertTriangle, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Checkbox,
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
	Switch,
	Textarea,
} from "~@/ui";

import type {
	AlertRule,
	AlertRuleNotification,
	AlertRuleScopeType,
	AlertRuleSeverity,
	SensorType,
} from "./types";

interface SensorTypeOption {
	value: SensorType;
	label: string;
	unit: string;
}

interface SiteOption {
	id: string;
	name: string;
}

interface EquipmentOption {
	id: string;
	name: string;
}

interface AlertRuleEditorProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	rule: AlertRule | null;
	onSave: (rule: AlertRule) => void;
	sensorTypeOptions: SensorTypeOption[];
	sites: SiteOption[];
	equipment: EquipmentOption[];
	timeOptions: { value: number; label: string }[];
}

interface FormData {
	name: string;
	description: string;
	enabled: boolean;
	sensorTypes: SensorType[];
	scopeType: AlertRuleScopeType;
	selectedSites: string[];
	selectedEquipment: string[];
	minThreshold: string;
	maxThreshold: string;
	unit: string;
	minOutOfRangeSeconds: number;
	severity: AlertRuleSeverity;
	notifications: AlertRuleNotification[];
	cooldownMinutes: string;
}

const getDefaultFormData = (): FormData => ({
	name: "",
	description: "",
	enabled: true,
	sensorTypes: [],
	scopeType: "all",
	selectedSites: [],
	selectedEquipment: [],
	minThreshold: "",
	maxThreshold: "",
	unit: "°C",
	minOutOfRangeSeconds: 120,
	severity: "warning",
	notifications: [{ channel: "email", recipientName: "", recipientEmail: "", reason: "" }],
	cooldownMinutes: "",
});

export function AlertRuleEditor({
	open,
	onOpenChange,
	rule,
	onSave,
	sensorTypeOptions,
	sites,
	equipment,
	timeOptions,
}: AlertRuleEditorProps) {
	const [formData, setFormData] = useState<FormData>(getDefaultFormData());
	const [errors, setErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		if (rule) {
			setFormData({
				name: rule.name,
				description: rule.description || "",
				enabled: rule.enabled,
				sensorTypes: rule.sensorTypes,
				scopeType: rule.scope.type,
				selectedSites: rule.scope.siteIds || [],
				selectedEquipment: rule.scope.equipmentIds || [],
				minThreshold: rule.thresholds.min?.toString() || "",
				maxThreshold: rule.thresholds.max?.toString() || "",
				unit: rule.thresholds.unit,
				minOutOfRangeSeconds: rule.minOutOfRangeSeconds,
				severity: rule.severity,
				notifications: rule.notifications.length
					? rule.notifications
					: [{ channel: "email", recipientName: "", recipientEmail: "", reason: "" }],
				cooldownMinutes: rule.cooldownMinutes?.toString() || "",
			});
		} else {
			setFormData(getDefaultFormData());
		}
		setErrors({});
	}, [rule, open]);

	const handleSensorTypeToggle = (type: SensorType) => {
		const newTypes = formData.sensorTypes.includes(type)
			? formData.sensorTypes.filter((t) => t !== type)
			: [...formData.sensorTypes, type];

		// Update unit based on first selected sensor type
		const firstType = newTypes[0];
		const option = sensorTypeOptions.find((o) => o.value === firstType);

		setFormData({
			...formData,
			sensorTypes: newTypes,
			unit: option?.unit || "°C",
		});
	};

	// More methods continued below...
	const handleSiteToggle = (siteId: string) => {
		const newSites = formData.selectedSites.includes(siteId)
			? formData.selectedSites.filter((s) => s !== siteId)
			: [...formData.selectedSites, siteId];
		setFormData({ ...formData, selectedSites: newSites });
	};

	const handleEquipmentToggle = (eqId: string) => {
		const newEq = formData.selectedEquipment.includes(eqId)
			? formData.selectedEquipment.filter((e) => e !== eqId)
			: [...formData.selectedEquipment, eqId];
		setFormData({ ...formData, selectedEquipment: newEq });
	};

	const addNotification = () => {
		setFormData({
			...formData,
			notifications: [
				...formData.notifications,
				{ channel: "email", recipientName: "", recipientEmail: "", reason: "" },
			],
		});
	};

	const removeNotification = (index: number) => {
		if (formData.notifications.length > 1) {
			const newNotifications = formData.notifications.filter((_, i) => i !== index);
			setFormData({ ...formData, notifications: newNotifications });
		}
	};

	const updateNotification = (index: number, field: keyof AlertRuleNotification, value: string) => {
		const newNotifications = [...formData.notifications];
		newNotifications[index] = { ...newNotifications[index], [field]: value };
		setFormData({ ...formData, notifications: newNotifications });
	};

	const validate = (): boolean => {
		const newErrors: Record<string, string> = {};

		if (!formData.name.trim()) {
			newErrors.name = t`Name is required`;
		}

		if (formData.sensorTypes.length === 0) {
			newErrors.sensorTypes = t`At least one sensor type is required`;
		}

		if (!formData.minThreshold && !formData.maxThreshold) {
			newErrors.thresholds = t`At least one threshold (min or max) is required`;
		}

		if (formData.minThreshold && formData.maxThreshold) {
			const min = parseFloat(formData.minThreshold);
			const max = parseFloat(formData.maxThreshold);
			if (min >= max) {
				newErrors.thresholds = t`Min must be less than max`;
			}
		}

		if (formData.scopeType === "sites" && formData.selectedSites.length === 0) {
			newErrors.scope = t`At least one site must be selected`;
		}

		if (formData.scopeType === "equipment" && formData.selectedEquipment.length === 0) {
			newErrors.scope = t`At least one equipment must be selected`;
		}

		const hasValidNotification = formData.notifications.some(
			(n) => n.recipientEmail && n.recipientEmail.includes("@"),
		);
		if (!hasValidNotification) {
			newErrors.notifications = t`At least one valid email recipient is required`;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = () => {
		if (!validate()) return;

		const newRule: AlertRule = {
			id: rule?.id || `rule-${Date.now()}`,
			name: formData.name,
			description: formData.description || undefined,
			enabled: formData.enabled,
			sensorTypes: formData.sensorTypes,
			scope: {
				type: formData.scopeType,
				...(formData.scopeType === "sites" && { siteIds: formData.selectedSites }),
				...(formData.scopeType === "equipment" && { equipmentIds: formData.selectedEquipment }),
			},
			thresholds: {
				...(formData.minThreshold && { min: parseFloat(formData.minThreshold) }),
				...(formData.maxThreshold && { max: parseFloat(formData.maxThreshold) }),
				unit: formData.unit,
			},
			minOutOfRangeSeconds: formData.minOutOfRangeSeconds,
			severity: formData.severity,
			notifications: formData.notifications.filter((n) => n.recipientEmail),
			...(formData.cooldownMinutes && { cooldownMinutes: parseInt(formData.cooldownMinutes, 10) }),
			createdAt: rule?.createdAt || new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		onSave(newRule);
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>{rule ? t`Edit Alert Rule` : t`Create Alert Rule`}</DialogTitle>
					<DialogDescription>
						{t`Configure alert thresholds, notifications, and targeting for this rule.`}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Basic Information */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">{t`Basic Information`}</h3>
						<div className="space-y-2">
							<label htmlFor="rule-name" className="text-sm font-medium">
								{t`Rule Name`} <span className="text-destructive">*</span>
							</label>
							<Input
								id="rule-name"
								value={formData.name}
								onChange={(e) => setFormData({ ...formData, name: e.target.value })}
								placeholder={t`e.g., High Temperature Alert`}
								aria-invalid={!!errors.name}
							/>
							{errors.name && <p className="text-destructive text-sm">{errors.name}</p>}
						</div>
						<div className="space-y-2">
							<label htmlFor="rule-description" className="text-sm font-medium">
								{t`Description`}
							</label>
							<Textarea
								id="rule-description"
								value={formData.description}
								onChange={(e) => setFormData({ ...formData, description: e.target.value })}
								placeholder={t`Optional description...`}
								rows={2}
							/>
						</div>
						<div className="flex items-center gap-2">
							<Switch
								id="rule-enabled"
								checked={formData.enabled}
								onCheckedChange={(checked) => setFormData({ ...formData, enabled: checked })}
							/>
							<label htmlFor="rule-enabled" className="text-sm">
								{t`Enable rule`}
							</label>
						</div>
					</div>

					<Separator />

					{/* Sensor Types */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">
							{t`Sensor Types`} <span className="text-destructive">*</span>
						</h3>
						<div className="flex flex-wrap gap-2">
							{sensorTypeOptions.map((option) => (
								<Badge
									key={option.value}
									variant={formData.sensorTypes.includes(option.value) ? "default" : "outline"}
									className="cursor-pointer"
									onClick={() => handleSensorTypeToggle(option.value)}
								>
									{option.label}
								</Badge>
							))}
						</div>
						{errors.sensorTypes && <p className="text-destructive text-sm">{errors.sensorTypes}</p>}
					</div>

					<Separator />

					{/* Scope */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">{t`Scope`}</h3>
						<Select
							value={formData.scopeType}
							onValueChange={(value: AlertRuleScopeType) =>
								setFormData({
									...formData,
									scopeType: value,
									selectedSites: [],
									selectedEquipment: [],
								})
							}
						>
							<SelectTrigger>
								<SelectValue placeholder={t`Select scope`} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Equipment`}</SelectItem>
								<SelectItem value="sites">{t`Specific Sites`}</SelectItem>
								<SelectItem value="equipment">{t`Specific Equipment`}</SelectItem>
							</SelectContent>
						</Select>

						{formData.scopeType === "sites" && (
							<div className="max-h-32 space-y-2 overflow-y-auto rounded-md border p-3">
								{sites.map((site) => (
									<div key={site.id} className="flex items-center gap-2">
										<Checkbox
											id={`site-${site.id}`}
											checked={formData.selectedSites.includes(site.id)}
											onCheckedChange={() => handleSiteToggle(site.id)}
										/>
										<label htmlFor={`site-${site.id}`} className="text-sm">
											{site.name}
										</label>
									</div>
								))}
							</div>
						)}

						{formData.scopeType === "equipment" && (
							<div className="max-h-32 space-y-2 overflow-y-auto rounded-md border p-3">
								{equipment.map((eq) => (
									<div key={eq.id} className="flex items-center gap-2">
										<Checkbox
											id={`eq-${eq.id}`}
											checked={formData.selectedEquipment.includes(eq.id)}
											onCheckedChange={() => handleEquipmentToggle(eq.id)}
										/>
										<label htmlFor={`eq-${eq.id}`} className="text-sm">
											{eq.name}
										</label>
									</div>
								))}
							</div>
						)}

						{errors.scope && <p className="text-destructive text-sm">{errors.scope}</p>}
					</div>

					<Separator />

					{/* Thresholds */}
					<div className="space-y-4">
						<h3 className="text-sm font-medium">
							{t`Thresholds`} <span className="text-destructive">*</span>
						</h3>
						<div className="grid grid-cols-2 gap-4">
							<div className="space-y-2">
								<label htmlFor="min-threshold" className="text-sm">
									{t`Min`} ({formData.unit})
								</label>
								<Input
									id="min-threshold"
									type="number"
									value={formData.minThreshold}
									onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
									placeholder={t`Min value`}
								/>
							</div>
							<div className="space-y-2">
								<label htmlFor="max-threshold" className="text-sm">
									{t`Max`} ({formData.unit})
								</label>
								<Input
									id="max-threshold"
									type="number"
									value={formData.maxThreshold}
									onChange={(e) => setFormData({ ...formData, maxThreshold: e.target.value })}
									placeholder={t`Max value`}
								/>
							</div>
						</div>
						{errors.thresholds && <p className="text-destructive text-sm">{errors.thresholds}</p>}
					</div>

					<Separator />

					{/* Time and Severity */}
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<label htmlFor="time-range" className="text-sm font-medium">
								{t`Time Out of Range`}
							</label>
							<Select
								value={formData.minOutOfRangeSeconds.toString()}
								onValueChange={(value) =>
									setFormData({ ...formData, minOutOfRangeSeconds: parseInt(value, 10) })
								}
							>
								<SelectTrigger id="time-range">
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
							<label htmlFor="severity" className="text-sm font-medium">
								{t`Severity`}
							</label>
							<Select
								value={formData.severity}
								onValueChange={(value: AlertRuleSeverity) =>
									setFormData({ ...formData, severity: value })
								}
							>
								<SelectTrigger id="severity">
									<SelectValue placeholder={t`Select severity`} />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="warning">{t`Warning`}</SelectItem>
									<SelectItem value="alert">{t`Alert`}</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>

					<Separator />

					{/* Notifications */}
					<div className="space-y-4">
						<div className="flex items-center justify-between">
							<h3 className="text-sm font-medium">
								{t`Notifications`} <span className="text-destructive">*</span>
							</h3>
							<Button variant="outline" size="sm" onClick={addNotification}>
								<Plus className="mr-1 h-3 w-3" />
								{t`Add Recipient`}
							</Button>
						</div>

						{formData.notifications.map((notification, index) => (
							<div key={index} className="space-y-3 rounded-md border p-3">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground text-xs">{t`Recipient ${index + 1}`}</span>
									{formData.notifications.length > 1 && (
										<Button
											variant="ghost"
											size="icon-sm"
											onClick={() => removeNotification(index)}
											aria-label={t`Remove recipient`}
										>
											<Trash2 className="h-3 w-3" />
										</Button>
									)}
								</div>
								<div className="grid grid-cols-2 gap-3">
									<Input
										placeholder={t`Name`}
										value={notification.recipientName || ""}
										onChange={(e) => updateNotification(index, "recipientName", e.target.value)}
									/>
									<Input
										placeholder={t`Email *`}
										type="email"
										value={notification.recipientEmail}
										onChange={(e) => updateNotification(index, "recipientEmail", e.target.value)}
									/>
								</div>
								<Input
									placeholder={t`Reason (optional)`}
									value={notification.reason || ""}
									onChange={(e) => updateNotification(index, "reason", e.target.value)}
								/>
							</div>
						))}

						{errors.notifications && (
							<p className="text-destructive text-sm">{errors.notifications}</p>
						)}
					</div>

					<Separator />

					{/* Cooldown */}
					<div className="space-y-2">
						<label htmlFor="cooldown" className="text-sm font-medium">
							{t`Cooldown Period (minutes)`}
						</label>
						<Input
							id="cooldown"
							type="number"
							value={formData.cooldownMinutes}
							onChange={(e) => setFormData({ ...formData, cooldownMinutes: e.target.value })}
							placeholder={t`e.g., 15 (optional)`}
						/>
						<p className="text-muted-foreground text-xs">
							{t`Time before re-alerting after an alert is triggered.`}
						</p>
					</div>

					<Separator />

					{/* Rule Preview */}
					<Card>
						<CardHeader className="pb-2">
							<CardTitle className="flex items-center gap-2 text-sm">
								<AlertTriangle className="h-4 w-4" />
								{t`Rule Preview`}
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground text-sm">
								{formData.name || t`Untitled Rule`} {t`will trigger a`}{" "}
								<span className="font-medium">{formData.severity}</span> {t`when`}{" "}
								{formData.sensorTypes.length > 0
									? formData.sensorTypes.join(", ")
									: t`selected sensors`}{" "}
								{t`readings are`}{" "}
								{formData.minThreshold && formData.maxThreshold
									? t`outside ${formData.minThreshold} - ${formData.maxThreshold} ${formData.unit}`
									: formData.minThreshold
										? t`below ${formData.minThreshold} ${formData.unit}`
										: formData.maxThreshold
											? t`above ${formData.maxThreshold} ${formData.unit}`
											: t`out of range`}{" "}
								{t`for more than`}{" "}
								{timeOptions.find((o) => o.value === formData.minOutOfRangeSeconds)?.label ||
									t`2 minutes`}
								.
							</p>
						</CardContent>
					</Card>
				</div>

				<DialogFooter>
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						{t`Cancel`}
					</Button>
					<Button onClick={handleSubmit}>{rule ? t`Save Changes` : t`Create Rule`}</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
