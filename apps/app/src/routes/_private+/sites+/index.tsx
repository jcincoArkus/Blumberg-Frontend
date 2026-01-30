import {
	Activity,
	AlertTriangle,
	Building2,
	CheckCircle2,
	ChevronRight,
	Droplets,
	MapPin,
	Thermometer,
	XCircle,
	Zap,
} from "lucide-react";
import { Link } from "react-router";

import { getAllSitesWithStats, type SiteWithStats, siteData as sites } from "~@/mock-data";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "~@/ui";
import { DashboardShell } from "~@/views";

function getStatusConfig(status: string) {
	switch (status) {
		case "operational":
			return {
				label: "Operational",
				bgColor: "bg-emerald-50 border-emerald-200",
				textColor: "text-emerald-700",
				borderColor: "border-t-emerald-500",
				icon: CheckCircle2,
			};
		case "warning":
			return {
				label: "Warning",
				bgColor: "bg-amber-50 border-amber-200",
				textColor: "text-amber-700",
				borderColor: "border-t-amber-500",
				icon: AlertTriangle,
			};
		case "critical":
			return {
				label: "Critical",
				bgColor: "bg-red-50 border-red-200",
				textColor: "text-red-700",
				borderColor: "border-t-red-500",
				icon: XCircle,
			};
		default:
			return {
				label: "Unknown",
				bgColor: "bg-gray-50 border-gray-200",
				textColor: "text-gray-700",
				borderColor: "border-t-gray-500",
				icon: Activity,
			};
	}
}

function SiteCard({ site }: { site: SiteWithStats }) {
	const statusConfig = getStatusConfig(site.status);
	const StatusIcon = statusConfig.icon;

	return (
		<Card
			className={`h-full hover:shadow-md transition-shadow border-t-4 ${statusConfig.borderColor}`}
		>
			<CardHeader className="pb-3">
				<div className="flex items-start justify-between">
					<div className="flex items-center gap-3">
						<div className={`p-2 rounded-lg ${statusConfig.bgColor}`}>
							<Building2 className={`size-5 ${statusConfig.textColor}`} />
						</div>
						<div>
							<CardTitle className="text-base font-semibold">{site.name}</CardTitle>
							<div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
								<MapPin className="size-3" />
								{site.location}
							</div>
						</div>
					</div>
					<Badge className={`${statusConfig.bgColor} ${statusConfig.textColor} border`}>
						<StatusIcon className="size-3 mr-1" />
						{statusConfig.label}
					</Badge>
				</div>
			</CardHeader>

			<CardContent className="space-y-4">
				<div className="grid grid-cols-3 gap-2 text-center">
					<div className="p-2 rounded-lg bg-muted/50">
						<p className="text-lg font-bold text-foreground">{site.equipmentCount}</p>
						<p className="text-xs text-muted-foreground">Equipment</p>
					</div>
					<div className="p-2 rounded-lg bg-muted/50">
						<p className="text-lg font-bold text-foreground">{site.sensorCount}</p>
						<p className="text-xs text-muted-foreground">Sensors</p>
					</div>
					<div className={`p-2 rounded-lg ${site.activeAlerts > 0 ? "bg-red-50" : "bg-muted/50"}`}>
						<p
							className={`text-lg font-bold ${site.activeAlerts > 0 ? "text-red-600" : "text-foreground"}`}
						>
							{site.activeAlerts}
						</p>
						<p className="text-xs text-muted-foreground">Alerts</p>
					</div>
				</div>

				<div className="flex items-center gap-3 text-xs text-muted-foreground">
					<div className="flex items-center gap-1">
						<Thermometer className="size-3 text-blue-500" />
						<span>{site.sensorsByType.temperature}</span>
					</div>
					<div className="flex items-center gap-1">
						<Droplets className="size-3 text-cyan-500" />
						<span>{site.sensorsByType.humidity}</span>
					</div>
					<div className="flex items-center gap-1">
						<Zap className="size-3 text-amber-500" />
						<span>{site.sensorsByType.energy}</span>
					</div>
					<div className="flex items-center gap-1">
						<Activity className="size-3 text-purple-500" />
						<span>{site.sensorsByType.pressure}</span>
					</div>
				</div>

				<div>
					<div className="flex items-center justify-between text-xs mb-1">
						<span className="text-muted-foreground">Sensor Health</span>
						<span className="font-medium text-foreground">{site.healthyPercent}%</span>
					</div>
					<div className="h-2 rounded-full bg-muted overflow-hidden">
						<div
							className={`h-full rounded-full transition-all ${
								site.healthyPercent >= 90
									? "bg-emerald-500"
									: site.healthyPercent >= 70
										? "bg-amber-500"
										: "bg-red-500"
							}`}
							style={{ width: `${site.healthyPercent}%` }}
						/>
					</div>
				</div>

				<Link
					to={`/sites/${site.id}`}
					className="flex items-center justify-end text-sm text-primary font-medium pt-2 border-t hover:text-primary/80 transition-colors"
				>
					View Details
					<ChevronRight className="size-4 ml-1" />
				</Link>
			</CardContent>
		</Card>
	);
}

export default function SitesPage() {
	const sitesWithStats = getAllSitesWithStats();
	const totalSites = sites.length;
	const operationalSites = sites.filter((s) => s.status === "operational").length;
	const warningSites = sites.filter((s) => s.status === "warning").length;
	const criticalSites = sites.filter((s) => s.status === "critical").length;

	return (
		<DashboardShell showDomainTabs={false}>
			<div className="space-y-6">
				<div className="flex flex-col gap-1">
					<h1 className="text-2xl font-bold text-foreground">Sites Overview</h1>
					<p className="text-muted-foreground">Monitor and manage all facility locations</p>
				</div>

				{/* KPI Cards */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<Card className="border-l-4 border-l-primary">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Total Sites</p>
									<p className="text-2xl font-bold text-foreground">{totalSites}</p>
								</div>
								<Building2 className="size-8 text-primary/20" aria-hidden="true" />
							</div>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-emerald-500">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Operational</p>
									<p className="text-2xl font-bold text-emerald-600">{operationalSites}</p>
								</div>
								<CheckCircle2 className="size-8 text-emerald-500/20" aria-hidden="true" />
							</div>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-amber-500">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Warning</p>
									<p className="text-2xl font-bold text-amber-600">{warningSites}</p>
								</div>
								<AlertTriangle className="size-8 text-amber-500/20" aria-hidden="true" />
							</div>
						</CardContent>
					</Card>

					<Card className="border-l-4 border-l-red-500">
						<CardContent className="p-4">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm text-muted-foreground">Critical</p>
									<p className="text-2xl font-bold text-red-600">{criticalSites}</p>
								</div>
								<XCircle className="size-8 text-red-500/20" aria-hidden="true" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Site Cards Grid */}
				<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
					{sitesWithStats.map((site) => (
						<SiteCard key={site.id} site={site} />
					))}
				</div>
			</div>
		</DashboardShell>
	);
}
