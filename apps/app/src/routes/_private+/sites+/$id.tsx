import {
	Activity,
	AlertTriangle,
	ArrowLeft,
	CheckCircle2,
	Clock,
	ExternalLink,
	MapPin,
	Thermometer,
	XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router";

import {
	Badge,
	Button,
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";
import { SiteTrendCharts } from "~@/views";

import {
	type Equipment,
	getAlertsBySite,
	getEquipmentBySite,
	getSensorsBySite,
	getSiteById,
} from "../../../mock-data/sites";

function getSiteStatusConfig(status: string, hasActiveAlerts: boolean, hasCritical: boolean) {
	if (status === "critical" || hasCritical) {
		return {
			label: "Alert",
			color: "bg-red-500",
			textColor: "text-red-700",
			bgLight: "bg-red-50",
			borderColor: "border-red-200",
			icon: XCircle,
		};
	}
	if (status === "warning" || hasActiveAlerts) {
		return {
			label: "Warning",
			color: "bg-amber-500",
			textColor: "text-amber-700",
			bgLight: "bg-amber-50",
			borderColor: "border-amber-200",
			icon: AlertTriangle,
		};
	}
	return {
		label: "OK",
		color: "bg-emerald-500",
		textColor: "text-emerald-700",
		bgLight: "bg-emerald-50",
		borderColor: "border-emerald-200",
		icon: CheckCircle2,
	};
}

function getEquipmentStatusConfig(status: string) {
	switch (status) {
		case "warning":
			return {
				label: "Warning",
				color: "bg-amber-100 text-amber-800 border-amber-200",
				dotColor: "bg-amber-500",
			};
		case "offline":
			return {
				label: "Alert",
				color: "bg-red-100 text-red-800 border-red-200",
				dotColor: "bg-red-500",
			};
		case "maintenance":
			return {
				label: "Maintenance",
				color: "bg-slate-100 text-slate-800 border-slate-200",
				dotColor: "bg-slate-500",
			};
		default:
			return {
				label: "OK",
				color: "bg-emerald-100 text-emerald-800 border-emerald-200",
				dotColor: "bg-emerald-500",
			};
	}
}

function formatLastUpdate(dateStr: string) {
	const date = new Date(dateStr);
	return date.toLocaleTimeString("en-US", {
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatAlertDuration(createdAt: string): string {
	const created = new Date(createdAt);
	const now = new Date();
	const diffMs = now.getTime() - created.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffDays > 0) {
		const remainingHours = diffHours % 24;
		return `${diffDays}d ${remainingHours}h`;
	}
	if (diffHours > 0) {
		const remainingMins = diffMins % 60;
		return `${diffHours}h ${remainingMins}m`;
	}
	return `${diffMins}m`;
}

function EquipmentRow({ eq }: { eq: Equipment }) {
	const eqStatus = getEquipmentStatusConfig(eq.status);

	return (
		<TableRow
			className={eq.status === "warning" || eq.status === "offline" ? "bg-amber-50/50" : ""}
		>
			<TableCell>
				<Link
					to={`/equipment/${eq.id}`}
					className="font-medium hover:text-primary hover:underline flex items-center gap-2"
				>
					<Thermometer className="size-4 text-muted-foreground" aria-hidden="true" />
					{eq.name}
				</Link>
			</TableCell>
			<TableCell className="text-muted-foreground">{eq.type}</TableCell>
			<TableCell>
				<Badge variant="outline" className={`${eqStatus.color} font-medium`}>
					<span className={`size-2 rounded-full ${eqStatus.dotColor} mr-1.5`} aria-hidden="true" />
					{eqStatus.label}
				</Badge>
			</TableCell>
			<TableCell className="text-center">
				<span className="inline-flex items-center gap-1">
					<Activity className="size-3.5 text-muted-foreground" aria-hidden="true" />
					{eq.sensorCount}
				</span>
			</TableCell>
			<TableCell className="text-center">
				{eq.activeAlerts > 0 ? (
					<span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
						{eq.activeAlerts}
					</span>
				) : (
					<span className="inline-flex items-center justify-center min-w-[24px] h-6 px-2 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium">
						0
					</span>
				)}
			</TableCell>
			<TableCell>
				<div className="flex items-center gap-1.5 text-muted-foreground text-sm">
					<Clock className="size-3.5" aria-hidden="true" />
					{formatLastUpdate(eq.lastUpdate)}
				</div>
			</TableCell>
			<TableCell className="text-right">
				<Button variant="ghost" size="sm" asChild>
					<Link to={`/equipment/${eq.id}`} aria-label={`View ${eq.name} details`}>
						<ExternalLink className="size-4" />
					</Link>
				</Button>
			</TableCell>
		</TableRow>
	);
}

export default function SiteDetailPage() {
	const { id } = useParams();
	const site = getSiteById(id ?? "");

	if (!site) {
		return (
			<div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
				<h1 className="text-2xl font-bold text-foreground">Site Not Found</h1>
				<p className="text-muted-foreground">The site you're looking for doesn't exist.</p>
				<Button asChild>
					<Link to="/sites" aria-label="Back to sites list">
						<ArrowLeft className="size-4 mr-2" />
						Back to Sites
					</Link>
				</Button>
			</div>
		);
	}

	const siteEquipment = getEquipmentBySite(site.id);
	const sensors = getSensorsBySite(site.id);
	const alerts = getAlertsBySite(site.id);
	const activeAlerts = alerts.filter((a) => a.status === "active" || a.status === "acknowledged");
	const criticalAlerts = activeAlerts.filter((a) => a.severity === "critical");

	const statusConfig = getSiteStatusConfig(
		site.status,
		activeAlerts.length > 0,
		criticalAlerts.length > 0,
	);
	const StatusIcon = statusConfig.icon;

	return (
		<div className="space-y-6 p-6">
			{/* Header */}
			<div className="flex items-start justify-between">
				<div className="flex items-center gap-4">
					<Button variant="ghost" size="sm" asChild>
						<Link to="/sites">
							<ArrowLeft className="size-4 mr-2" />
							Back
						</Link>
					</Button>
					<div>
						<div className="flex items-center gap-3">
							<h1 className="text-2xl font-bold text-foreground">{site.name}</h1>
							<Badge
								className={`${statusConfig.bgLight} ${statusConfig.textColor} border ${statusConfig.borderColor}`}
							>
								<StatusIcon className="size-3 mr-1" />
								{statusConfig.label}
							</Badge>
						</div>
						<div className="flex items-center gap-1 text-muted-foreground mt-1">
							<MapPin className="size-4" />
							{site.location}
						</div>
					</div>
				</div>
			</div>

			{/* Quick Stats */}
			<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
				<Card>
					<CardContent className="p-4">
						<p className="text-sm text-muted-foreground">Equipment</p>
						<p className="text-2xl font-bold">{siteEquipment.length}</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-sm text-muted-foreground">Sensors</p>
						<p className="text-2xl font-bold">{sensors.length}</p>
					</CardContent>
				</Card>
				<Card className={activeAlerts.length > 0 ? "border-red-200 bg-red-50/50" : ""}>
					<CardContent className="p-4">
						<p className="text-sm text-muted-foreground">Active Alerts</p>
						<p className={`text-2xl font-bold ${activeAlerts.length > 0 ? "text-red-600" : ""}`}>
							{activeAlerts.length}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="p-4">
						<p className="text-sm text-muted-foreground">Sensor Health</p>
						<p className="text-2xl font-bold">
							{sensors.length > 0
								? Math.round(
										(sensors.filter((s) => s.status === "active").length / sensors.length) * 100,
									)
								: 0}
							%
						</p>
					</CardContent>
				</Card>
			</div>

			{/* Active Alerts Panel */}
			{activeAlerts.length > 0 && (
				<Card className="border-red-200 bg-red-50/30">
					<CardHeader className="pb-3">
						<CardTitle className="text-red-700 flex items-center gap-2">
							<AlertTriangle className="size-5" aria-hidden="true" />
							Active Alerts ({activeAlerts.length})
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-2">
							{activeAlerts.slice(0, 5).map((alert) => (
								<div
									key={alert.id}
									className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100"
								>
									<div className="flex items-center gap-3">
										<Badge
											variant="outline"
											className={
												alert.severity === "critical"
													? "bg-red-100 text-red-700 border-red-200"
													: alert.severity === "high"
														? "bg-orange-100 text-orange-700 border-orange-200"
														: alert.severity === "medium"
															? "bg-amber-100 text-amber-700 border-amber-200"
															: "bg-blue-100 text-blue-700 border-blue-200"
											}
										>
											{alert.severity}
										</Badge>
										<div>
											<div className="font-medium text-sm">{alert.name}</div>
											<div className="text-xs text-muted-foreground">{alert.description}</div>
										</div>
									</div>
									<div className="text-xs text-muted-foreground">
										{formatAlertDuration(alert.createdAt)}
									</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Trends */}
			<SiteTrendCharts />

			{/* Equipment Table */}
			<Card>
				<CardHeader>
					<CardTitle>Equipment</CardTitle>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Status</TableHead>
								<TableHead className="text-center">Sensors</TableHead>
								<TableHead className="text-center">Alerts</TableHead>
								<TableHead>Last Update</TableHead>
								<TableHead className="text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{siteEquipment.map((eq) => (
								<EquipmentRow key={eq.id} eq={eq} />
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
}
