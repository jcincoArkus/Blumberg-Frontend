import {
	AlertCircle,
	AlertTriangle,
	CheckCircle2,
	Clock,
	Database,
	X,
	XCircle,
} from "lucide-react";
import type React from "react";

import type { SensorHealthDetailResponse } from "~@/api";
import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	cn,
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	Progress,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Separator,
} from "~@/ui";

import type { QualityWindow, SensorHealthData } from "./types";

interface SensorHealthDetailsDrawerProps {
	data: SensorHealthData;
	detail?: SensorHealthDetailResponse | undefined;
	detailLoading?: boolean;
	/** Per-sensor ingestion rejection count in last 24h (null = loading) */
	ingestionErrorCount?: number | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
	timeWindow: QualityWindow;
	onTimeWindowChange: (window: QualityWindow) => void;
}

function formatFreshnessSeconds(seconds: number): string {
	if (seconds < 60) return `${Math.round(seconds)}s`;
	const mins = Math.floor(seconds / 60);
	if (mins < 60) return `${mins}m`;
	const h = Math.floor(mins / 60);
	const m = mins % 60;
	return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function SensorHealthDetailsDrawer({
	data,
	detail,
	detailLoading = false,
	ingestionErrorCount = null,
	open,
	onOpenChange,
	timeWindow,
	onTimeWindowChange,
}: SensorHealthDetailsDrawerProps) {
	const formatTimestamp = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	const getHealthBadge = (status?: "healthy" | "stale" | "offline" | "warning" | "critical") => {
		if (!status) {
			return (
				<Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
					{t`Unknown`}
				</Badge>
			);
		}
		const config = {
			healthy: {
				label: t`Healthy`,
				className: "bg-emerald-100 text-emerald-700 border-emerald-200",
				icon: CheckCircle2,
			},
			stale: {
				label: t`Stale`,
				className: "bg-amber-100 text-amber-700 border-amber-200",
				icon: Clock,
			},
			offline: {
				label: t`Offline`,
				className: "bg-red-100 text-red-700 border-red-200",
				icon: XCircle,
			},
			warning: {
				label: t`Warning`,
				className: "bg-amber-100 text-amber-700 border-amber-200",
				icon: AlertTriangle,
			},
			critical: {
				label: t`Critical`,
				className: "bg-red-100 text-red-700 border-red-200",
				icon: XCircle,
			},
		};
		const cfg = config[status];
		const Icon = cfg.icon;
		return (
			<Badge variant="outline" className={cn("border font-semibold", cfg.className)}>
				<Icon className="size-3 mr-1" />
				{cfg.label}
			</Badge>
		);
	};

	const getAgeFormatted = () => {
		if (detail?.freshnessSeconds != null && detail.freshnessSeconds >= 0) {
			return formatFreshnessSeconds(detail.freshnessSeconds);
		}
		if (!data.health?.lastReportedAt) return t`N/A`;
		const now = Date.now();
		const lastReported = new Date(data.health.lastReportedAt).getTime();
		const ageMinutes = Math.floor((now - lastReported) / (60 * 1000));
		if (ageMinutes < 60) return `${ageMinutes}m`;
		if (ageMinutes < 1440) return `${Math.floor(ageMinutes / 60)}h ${ageMinutes % 60}m`;
		return `${Math.floor(ageMinutes / 1440)}d`;
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="h-full w-full sm:max-w-2xl">
				<DrawerHeader className="border-b">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<DrawerTitle className="text-xl font-semibold mb-2">
								{t`Sensor Health & Quality Diagnostics`}
							</DrawerTitle>
							<DrawerDescription>
								{data.sensor.name} ({data.sensor.id})
							</DrawerDescription>
						</div>
						<DrawerClose asChild>
							<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
								<X className="h-4 w-4" />
								<span className="sr-only">{t`Close`}</span>
							</Button>
						</DrawerClose>
					</div>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Sensor Info */}
					<div className="space-y-2">
						<div className="flex items-center gap-2 flex-wrap">
							<Badge variant="outline" className="capitalize">
								{data.sensor.type}
							</Badge>
							<span className="text-sm text-muted-foreground">•</span>
							<span className="text-sm text-muted-foreground">
								{data.sensor.siteName || t`Unknown Site`}
							</span>
							{data.sensor.equipmentName && (
								<>
									<span className="text-sm text-muted-foreground">•</span>
									<span className="text-sm text-muted-foreground">{data.sensor.equipmentName}</span>
								</>
							)}
						</div>
					</div>

					<Separator />

					{/* Sensor Health - continued in next part */}
					<SensorHealthSection
						data={data}
						getHealthBadge={getHealthBadge}
						formatTimestamp={formatTimestamp}
						ageFormatted={getAgeFormatted()}
					/>

					<Separator />

					{/* Data Quality Diagnostics */}
					<DataQualitySection
						data={data}
						detail={detail}
						detailLoading={detailLoading}
						timeWindow={timeWindow}
						onTimeWindowChange={onTimeWindowChange}
					/>

					<Separator />

					{/* Ingestion Errors */}
					<IngestionErrorsSection
						data={data}
						formatTimestamp={formatTimestamp}
						ingestionErrorCount={ingestionErrorCount}
					/>
				</div>
			</DrawerContent>
		</Drawer>
	);
}

// Sensor Health Section
interface SensorHealthSectionProps {
	data: SensorHealthData;
	getHealthBadge: (
		status?: "healthy" | "stale" | "offline" | "warning" | "critical",
	) => React.ReactNode;
	formatTimestamp: (dateString: string) => string;
	ageFormatted: string;
}

function SensorHealthSection({
	data,
	getHealthBadge,
	formatTimestamp,
	ageFormatted,
}: SensorHealthSectionProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold text-foreground">{t`Sensor Health`}</h3>

			<div className="space-y-3">
				<div className="flex items-center justify-between p-3 rounded-lg border bg-card">
					<div>
						<p className="text-xs text-muted-foreground mb-1">{t`Health Status`}</p>
						{getHealthBadge(data.health?.healthStatus)}
					</div>
				</div>

				{data.health && (
					<>
						<div>
							<p className="text-xs text-muted-foreground mb-1">{t`Last Reported`}</p>
							<p className="text-sm font-medium text-foreground">
								{formatTimestamp(data.health.lastReportedAt)}
							</p>
							<p className="text-xs text-muted-foreground mt-0.5">{t`${ageFormatted} ago`}</p>
						</div>

						<div>
							<p className="text-xs text-muted-foreground mb-1">{t`Expected Reporting Interval`}</p>
							<p className="text-sm font-medium text-foreground">
								{t`Every ${Math.floor(data.health.expectedIntervalSeconds / 60)} minutes`}
							</p>
						</div>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">{t`Classification Logic`}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-xs">
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">{t`Healthy:`}</span>
									<span className="font-medium">
										{t`Reported within ${Math.floor(data.health.warningThresholdSeconds / 60)} minutes`}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">{t`Stale:`}</span>
									<span className="font-medium">
										{t`Late beyond ${Math.floor(data.health.warningThresholdSeconds / 60)} minutes`}
									</span>
								</div>
								<div className="flex items-center justify-between">
									<span className="text-muted-foreground">{t`Silent:`}</span>
									<span className="font-medium">
										{t`Beyond ${Math.floor(data.health.criticalThresholdSeconds / 60)} minutes`}
									</span>
								</div>
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}

// Data Quality Section
interface DataQualitySectionProps {
	data: SensorHealthData;
	detail?: SensorHealthDetailResponse | undefined;
	detailLoading?: boolean;
	timeWindow: QualityWindow;
	onTimeWindowChange: (window: QualityWindow) => void;
}

function DataQualitySection({
	data,
	detail,
	detailLoading = false,
	timeWindow,
	onTimeWindowChange,
}: DataQualitySectionProps) {
	const hasDetailFromApi =
		detail &&
		detail.expectedPoints != null &&
		detail.receivedPoints != null &&
		detail.sensorId === data.sensor.id;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-foreground">{t`Data Quality Diagnostics`}</h3>
				<Select
					value={timeWindow}
					onValueChange={(value) => onTimeWindowChange(value as QualityWindow)}
				>
					<SelectTrigger className="h-8 w-30">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1h">{t`Last 1h`}</SelectItem>
						<SelectItem value="24h">{t`Last 24h`}</SelectItem>
						<SelectItem value="7d">{t`Last 7d`}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{detailLoading ? (
				<Card>
					<CardContent className="py-6">
						<p className="text-sm text-muted-foreground">{t`Loading diagnostics…`}</p>
					</CardContent>
				</Card>
			) : hasDetailFromApi ? (
				<Card>
					<CardHeader className="pb-3">
						<CardTitle className="text-sm">{t`Reading counts (last 24h)`}</CardTitle>
					</CardHeader>
					<CardContent className="space-y-3">
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">{t`Expected`}</span>
							<span className="text-sm font-medium">{detail.expectedPoints} points</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">{t`Received`}</span>
							<span className="text-sm font-medium">{detail.receivedPoints} points</span>
						</div>
						<div className="flex items-center justify-between">
							<span className="text-xs text-muted-foreground">{t`Missing`}</span>
							<span className="text-sm font-medium">
								{Math.max(0, (detail.expectedPoints ?? 0) - (detail.receivedPoints ?? 0))} points
							</span>
						</div>
						<div className="pt-2">
							<div className="flex items-center justify-between mb-1.5">
								<span className="text-xs font-medium text-foreground">{t`Completeness`}</span>
								<span className="text-xs font-medium text-foreground">
									{(detail.expectedPoints ?? 0) > 0
										? (((detail.receivedPoints ?? 0) / (detail.expectedPoints ?? 1)) * 100).toFixed(
												1,
											)
										: "100.0"}
									%
								</span>
							</div>
							<Progress
								value={
									(detail.expectedPoints ?? 0) > 0
										? ((detail.receivedPoints ?? 0) / (detail.expectedPoints ?? 1)) * 100
										: 100
								}
								className="h-2"
							/>
						</div>
					</CardContent>
				</Card>
			) : data.quality ? (
				<div className="space-y-4">
					{/* Missing Data Summary */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">{t`Missing Data Summary`}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<div className="flex items-center justify-between mb-1">
									<span className="text-xs text-muted-foreground">{t`Missing Count`}</span>
									<span className="text-sm font-medium">{t`${data.quality.missingPoints} points`}</span>
								</div>
								<div className="flex items-center justify-between mb-1">
									<span className="text-xs text-muted-foreground">{t`Expected`}</span>
									<span className="text-sm font-medium">{t`${data.quality.expectedPoints} points`}</span>
								</div>
								<div className="flex items-center justify-between mb-1">
									<span className="text-xs text-muted-foreground">{t`Received`}</span>
									<span className="text-sm font-medium">{t`${data.quality.receivedPoints} points`}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Inconsistency Summary */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">{t`Inconsistency Summary`}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">{t`Inconsistent Points`}</span>
								<span className="text-sm font-medium">{data.quality.inconsistentPoints}</span>
							</div>
							{data.quality.notes && (
								<p className="text-xs text-muted-foreground mt-2">{data.quality.notes}</p>
							)}
						</CardContent>
					</Card>

					{/* Quality Score Indicators */}
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">{t`Quality Score Indicators`}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<span className="text-xs font-medium text-foreground">{t`Completeness`}</span>
									<span className="text-xs font-medium text-foreground">
										{data.quality.completenessPct.toFixed(1)}%
									</span>
								</div>
								<Progress value={data.quality.completenessPct} className="h-2" />
							</div>
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<span className="text-xs font-medium text-foreground">{t`Consistency`}</span>
									<span className="text-xs font-medium text-foreground">
										{data.quality.consistencyPct.toFixed(1)}%
									</span>
								</div>
								<Progress value={data.quality.consistencyPct} className="h-2" />
							</div>
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<span className="text-xs font-medium text-foreground">{t`Freshness`}</span>
									<span className="text-xs font-medium text-foreground">
										{data.quality.freshnessPct.toFixed(1)}%
									</span>
								</div>
								<Progress value={data.quality.freshnessPct} className="h-2" />
							</div>
						</CardContent>
					</Card>
				</div>
			) : (
				<Card>
					<CardContent className="py-6 text-center">
						<Database className="size-8 mx-auto mb-2 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							{t`No data quality information available for this sensor.`}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// Ingestion Errors Section (per-sensor count from API)
interface IngestionErrorsSectionProps {
	data: SensorHealthData;
	formatTimestamp: (dateString: string) => string;
	/** Per-sensor rejection count in last 24h (null = loading) */
	ingestionErrorCount?: number | null;
}

function IngestionErrorsSection({
	data,
	formatTimestamp: _formatTimestamp,
	ingestionErrorCount = null,
}: IngestionErrorsSectionProps) {
	const count = ingestionErrorCount ?? data.ingestionErrors.length;
	const hasErrors =
		typeof ingestionErrorCount === "number"
			? ingestionErrorCount > 0
			: data.ingestionErrors.length > 0;
	const isLoading = ingestionErrorCount === null && data.ingestionErrors.length === 0;

	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold text-foreground">{t`Ingestion Errors`}</h3>

			{isLoading ? (
				<Card>
					<CardContent className="py-6 text-center">
						<p className="text-sm text-muted-foreground">{t`Loading…`}</p>
					</CardContent>
				</Card>
			) : hasErrors ? (
				<>
					<Card>
						<CardContent className="py-4">
							<p className="text-sm text-foreground">
								{count === 1
									? t`1 rejected reading in the last 24 hours.`
									: t`${count} rejected readings in the last 24 hours.`}
							</p>
							<p className="text-xs text-muted-foreground mt-1">
								{t`Rejections can be due to invalid sensor id, invalid unit, or other validation errors.`}
							</p>
						</CardContent>
					</Card>
					<div className="flex gap-2">
						<Button variant="outline" size="sm" className="flex-1">
							<AlertCircle className="size-4 mr-2" />
							{t`View ingestion runs`}
						</Button>
					</div>
				</>
			) : (
				<Card>
					<CardContent className="py-6 text-center">
						<CheckCircle2 className="size-8 mx-auto mb-2 text-emerald-500" />
						<p className="text-sm text-muted-foreground">
							{t`No ingestion errors in the last 24 hours.`}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

export { SensorHealthDetailsDrawer, type SensorHealthDetailsDrawerProps };
