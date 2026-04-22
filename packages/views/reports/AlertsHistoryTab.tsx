import { AlertTriangle, Bell, CheckCircle2, Clock, Eye } from "lucide-react";
import { useMemo, useState } from "react";

import { t } from "~@/i18n/macro";
import { getSeverityConfig } from "~@/models";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	cn,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import { AlertsTrendChart } from "./AlertsTrendChart";
import { HistoricalAlertDetailsDrawer } from "./HistoricalAlertDetailsDrawer";
import { TrendIndicator } from "./TrendIndicator";
import type { AlertSeverity, Equipment, HistoricalAlert } from "./types";

interface AlertsHistoryTabProps {
	alerts: HistoricalAlert[];
	previousAlerts: HistoricalAlert[];
	comparePrevious: boolean;
	equipment: Equipment[];
}

export function AlertsHistoryTab({
	alerts,
	previousAlerts,
	comparePrevious,
	equipment,
}: AlertsHistoryTabProps) {
	const [selectedAlert, setSelectedAlert] = useState<HistoricalAlert | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	// Calculate summary metrics
	const metrics = useMemo(() => {
		const total = alerts.length;
		const bySeverity = {
			critical: alerts.filter((a) => a.severity === "critical").length,
			warning: alerts.filter((a) => a.severity === "warning").length,
			info: alerts.filter((a) => a.severity === "info").length,
		};

		const resolved = alerts.filter((a) => a.status === "resolved" && a.durationSeconds);
		const avgDuration =
			resolved.length > 0
				? Math.round(
						resolved.reduce((sum, a) => sum + (a.durationSeconds || 0), 0) / resolved.length / 60,
					)
				: 0;

		return { total, bySeverity, avgDuration, resolved: resolved.length };
	}, [alerts]);

	// Calculate comparison
	const comparison = useMemo(() => {
		if (!comparePrevious || previousAlerts.length === 0) return null;
		const delta = ((metrics.total - previousAlerts.length) / previousAlerts.length) * 100;
		const trend = Math.abs(delta) < 5 ? "stable" : delta < 0 ? "improving" : "worsening";
		return {
			delta: Math.round(delta * 10) / 10,
			trend: trend as "improving" | "stable" | "worsening",
		};
	}, [comparePrevious, previousAlerts, metrics]);

	const formatTimestamp = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatDuration = (seconds?: number) => {
		if (!seconds) return t`N/A`;
		const minutes = Math.floor(seconds / 60);
		if (minutes < 60) return `${minutes}m`;
		const hours = Math.floor(minutes / 60);
		const mins = minutes % 60;
		return `${hours}h ${mins}m`;
	};

	const getSeverityBadge = (severity: AlertSeverity) => {
		const config = getSeverityConfig();
		const cfg = config[severity] ?? config.info;
		return (
			<Badge variant="outline" className={cn("border", cfg.className)}>
				{cfg.label}
			</Badge>
		);
	};

	const getStatusBadge = (status: string) => {
		const config = {
			active: {
				label: t`Active`,
				className: "bg-red-100 text-red-700 border-red-200",
				icon: AlertTriangle,
			},
			acknowledged: {
				label: t`Acknowledged`,
				className: "bg-amber-100 text-amber-700 border-amber-200",
				icon: Clock,
			},
			resolved: {
				label: t`Resolved`,
				className: "bg-emerald-100 text-emerald-700 border-emerald-200",
				icon: CheckCircle2,
			},
		};
		const cfg = config[status as keyof typeof config] || config.active;
		const Icon = cfg.icon;
		return (
			<Badge variant="outline" className={cn("border", cfg.className)}>
				<Icon className="mr-1 size-3" />
				{cfg.label}
			</Badge>
		);
	};

	// Group alerts by day for chart (backend severities: critical, warning, info)
	const chartData = useMemo(() => {
		const grouped = new Map<
			string,
			{ date: string; count: number; critical: number; warning: number; info: number }
		>();

		alerts.forEach((alert) => {
			const date = new Date(alert.createdAt);
			const dateKey = date.toLocaleDateString();

			if (!grouped.has(dateKey)) {
				grouped.set(dateKey, { date: dateKey, count: 0, critical: 0, warning: 0, info: 0 });
			}

			const entry = grouped.get(dateKey);
			if (!entry) return;
			entry.count += 1;
			if (alert.severity === "critical") entry.critical += 1;
			else if (alert.severity === "warning") entry.warning += 1;
			else if (alert.severity === "info") entry.info += 1;
		});

		return Array.from(grouped.values()).sort(
			(a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
		);
	}, [alerts]);

	const handleViewDetails = (alert: HistoricalAlert) => {
		setSelectedAlert(alert);
		setIsDetailsOpen(true);
	};

	const getEquipmentById = (id: string) => equipment.find((e) => e.id === id);

	if (alerts.length === 0) {
		return (
			<div className="py-12 text-center">
				<Bell className="mx-auto mb-2 size-8 text-muted-foreground" />
				<p className="mb-1 text-sm font-medium text-foreground">{t`No alerts found`}</p>
				<p className="text-xs text-muted-foreground">
					{t`No alerts available for the selected period and filters`}
				</p>
			</div>
		);
	}

	return (
		<>
			<div className="space-y-6">
				{/* Summary Metrics */}
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{t`Total Alerts`}</CardTitle>
							<Bell className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{metrics.total}</div>
							{comparison && (
								<TrendIndicator
									delta={comparison.delta}
									label={t`vs previous period`}
									trend={comparison.trend}
								/>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{t`By Severity`}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-1.5">
								<Badge variant="outline" className="border bg-red-100 text-red-700 border-red-200">
									{t`${metrics.bySeverity.critical} Critical`}
								</Badge>
								<Badge
									variant="outline"
									className="border bg-orange-100 text-orange-700 border-orange-200"
								>
									{t`${metrics.bySeverity.warning} Warning`}
								</Badge>
								<Badge
									variant="outline"
									className="border bg-blue-100 text-blue-700 border-blue-200"
								>
									{t`${metrics.bySeverity.info} Info`}
								</Badge>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{t`Avg Duration`}</CardTitle>
							<Clock className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{metrics.avgDuration}m</div>
							<p className="mt-1 text-xs text-muted-foreground">{t`Time to resolution`}</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{t`Resolved`}</CardTitle>
							<CheckCircle2 className="h-4 w-4 text-muted-foreground" />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{metrics.resolved}</div>
							<p className="mt-1 text-xs text-muted-foreground">
								{t`${metrics.total > 0 ? Math.round((metrics.resolved / metrics.total) * 100) : 0}% resolution rate`}
							</p>
						</CardContent>
					</Card>
				</div>

				{/* Alerts Trend Chart */}
				<Card>
					<CardHeader>
						<CardTitle>{t`Alerts Trend`}</CardTitle>
						<CardDescription>{t`Alert distribution by severity over time`}</CardDescription>
					</CardHeader>
					<CardContent>
						<AlertsTrendChart data={chartData} />
					</CardContent>
				</Card>

				{/* Alerts Table */}
				<Card>
					<CardHeader>
						<CardTitle>{t`Alerts Table`}</CardTitle>
						<CardDescription>{t`Historical alert records (showing first 100)`}</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto rounded-lg border bg-card">
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t`Created`}</TableHead>
										<TableHead>{t`Title`}</TableHead>
										<TableHead>{t`Severity`}</TableHead>
										<TableHead>{t`Status`}</TableHead>
										<TableHead>{t`Equipment`}</TableHead>
										<TableHead>{t`Duration`}</TableHead>
										<TableHead className="text-right">{t`Actions`}</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{alerts.slice(0, 100).map((alert) => {
										const eq = getEquipmentById(alert.equipmentId);
										return (
											<TableRow key={alert.id}>
												<TableCell className="text-sm">
													{formatTimestamp(alert.createdAt)}
												</TableCell>
												<TableCell>
													<p className="text-sm font-medium">{alert.title}</p>
													<p className="font-mono text-xs text-muted-foreground">{alert.id}</p>
												</TableCell>
												<TableCell>{getSeverityBadge(alert.severity)}</TableCell>
												<TableCell>{getStatusBadge(alert.status)}</TableCell>
												<TableCell className="text-sm text-muted-foreground">
													{eq?.name || alert.equipmentId}
												</TableCell>
												<TableCell className="text-sm">
													{formatDuration(alert.durationSeconds)}
												</TableCell>
												<TableCell className="text-right">
													<Button
														variant="ghost"
														size="sm"
														onClick={() => handleViewDetails(alert)}
													>
														<Eye className="mr-1 size-3" />
														{t`View`}
													</Button>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
						</div>
						{alerts.length > 100 && (
							<p className="mt-2 text-xs text-muted-foreground">
								{t`Showing first 100 of ${alerts.length.toLocaleString()} alerts`}
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			{/* Alert Details Drawer */}
			<HistoricalAlertDetailsDrawer
				alert={selectedAlert}
				equipment={selectedAlert ? getEquipmentById(selectedAlert.equipmentId) : undefined}
				open={isDetailsOpen}
				onOpenChange={setIsDetailsOpen}
			/>
		</>
	);
}
