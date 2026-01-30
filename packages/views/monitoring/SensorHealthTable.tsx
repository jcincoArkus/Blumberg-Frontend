import { Eye, Filter, MapPin, Search, X } from "lucide-react";
import { useState } from "react";

import {
	Badge,
	Button,
	cn,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import type { Equipment, QualityWindow, SensorHealthData, Site } from "./types";

interface SensorHealthTableProps {
	data: SensorHealthData[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	healthFilter: string;
	onHealthFilterChange: (status: string) => void;
	qualityFilter: string;
	onQualityFilterChange: (status: string) => void;
	ingestionFilter: string;
	onIngestionFilterChange: (status: string) => void;
	typeFilter: string;
	onTypeFilterChange: (type: string) => void;
	siteFilter: string;
	onSiteFilterChange: (site: string) => void;
	equipmentFilter: string;
	onEquipmentFilterChange: (equipment: string) => void;
	timeWindow: QualityWindow;
	onTimeWindowChange: (window: QualityWindow) => void;
	sites: Site[];
	equipment: Equipment[];
	onViewDetails: (data: SensorHealthData) => void;
}

const sensorTypeOptions = [
	{ value: "temperature", label: "Temperature" },
	{ value: "humidity", label: "Humidity" },
	{ value: "co2", label: "CO2" },
	{ value: "o2", label: "O2" },
	{ value: "pressure", label: "Pressure" },
	{ value: "energy", label: "Energy" },
];

function SensorHealthTable({
	data,
	searchQuery,
	onSearchChange,
	healthFilter,
	onHealthFilterChange,
	qualityFilter,
	onQualityFilterChange,
	ingestionFilter,
	onIngestionFilterChange,
	typeFilter,
	onTypeFilterChange,
	siteFilter,
	onSiteFilterChange,
	equipmentFilter,
	onEquipmentFilterChange,
	timeWindow,
	onTimeWindowChange,
	sites,
	equipment,
	onViewDetails,
}: SensorHealthTableProps) {
	const [showFilters, setShowFilters] = useState(false);

	const formatTimestamp = (dateString?: string) => {
		if (!dateString) return "Never";
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getHealthBadge = (status?: "healthy" | "stale" | "silent") => {
		if (!status) {
			return (
				<Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
					Unknown
				</Badge>
			);
		}
		const config = {
			healthy: {
				label: "Healthy",
				className: "bg-emerald-100 text-emerald-700 border-emerald-200",
			},
			stale: { label: "Stale", className: "bg-amber-100 text-amber-700 border-amber-200" },
			silent: { label: "Silent", className: "bg-red-100 text-red-700 border-red-200" },
		};
		const cfg = config[status];
		return (
			<Badge variant="outline" className={cn("border font-semibold", cfg.className)}>
				{cfg.label}
			</Badge>
		);
	};

	const getQualityBadge = (status?: "good" | "missing" | "inconsistent") => {
		if (!status) {
			return (
				<Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
					Unknown
				</Badge>
			);
		}
		const config = {
			good: { label: "Good", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
			missing: { label: "Missing", className: "bg-amber-100 text-amber-700 border-amber-200" },
			inconsistent: { label: "Inconsistent", className: "bg-red-100 text-red-700 border-red-200" },
		};
		const cfg = config[status];
		return (
			<Badge variant="outline" className={cn("border", cfg.className)}>
				{cfg.label}
			</Badge>
		);
	};

	const getIngestionBadge = (status: "ok" | "api_error" | "csv_error") => {
		const config = {
			ok: { label: "OK", className: "bg-emerald-100 text-emerald-700 border-emerald-200" },
			api_error: { label: "API Error", className: "bg-red-100 text-red-700 border-red-200" },
			csv_error: {
				label: "CSV Error",
				className: "bg-orange-100 text-orange-700 border-orange-200",
			},
		};
		const cfg = config[status];
		return (
			<Badge variant="outline" className={cn("border", cfg.className)}>
				{cfg.label}
			</Badge>
		);
	};

	const activeFiltersCount = [
		healthFilter !== "all",
		qualityFilter !== "all",
		ingestionFilter !== "all",
		typeFilter !== "all",
		siteFilter !== "all",
		equipmentFilter !== "all",
	].filter(Boolean).length;

	// Empty state
	if (data.length === 0) {
		return (
			<div className="py-12 text-center">
				<div className="flex justify-center mb-4">
					<div className="size-16 rounded-full bg-muted flex items-center justify-center">
						<X className="size-8 text-muted-foreground" />
					</div>
				</div>
				<p className="text-sm font-medium text-foreground mb-1">No sensors found</p>
				<p className="text-xs text-muted-foreground">
					{searchQuery || activeFiltersCount > 0
						? "Try adjusting your search or filters"
						: "No sensor data available"}
				</p>
			</div>
		);
	}

	return (
		<div className="space-y-4">
			{/* Search and Filters */}
			<div className="flex flex-col sm:flex-row gap-3">
				<div className="relative flex-1">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
					<Input
						placeholder="Search by sensor ID, name, site, equipment, or type..."
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-9"
					/>
				</div>
				<div className="flex gap-2">
					<Select
						value={timeWindow}
						onValueChange={(value) => onTimeWindowChange(value as QualityWindow)}
					>
						<SelectTrigger className="w-[140px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="1h">Last 1h</SelectItem>
							<SelectItem value="24h">Last 24h</SelectItem>
							<SelectItem value="7d">Last 7d</SelectItem>
						</SelectContent>
					</Select>
					<Button
						variant="outline"
						onClick={() => setShowFilters(!showFilters)}
						className="sm:w-auto"
					>
						<Filter className="size-4 mr-2" />
						Filters
						{activeFiltersCount > 0 && (
							<Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
								{activeFiltersCount}
							</Badge>
						)}
					</Button>
				</div>
			</div>

			{/* Filter Panel */}
			{showFilters && (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 p-4 border rounded-lg bg-muted/30">
					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
							Health Status
						</label>
						<Select value={healthFilter} onValueChange={onHealthFilterChange}>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Status</SelectItem>
								<SelectItem value="healthy">Healthy</SelectItem>
								<SelectItem value="stale">Stale</SelectItem>
								<SelectItem value="silent">Silent</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
							Data Quality
						</label>
						<Select value={qualityFilter} onValueChange={onQualityFilterChange}>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Quality</SelectItem>
								<SelectItem value="good">Good</SelectItem>
								<SelectItem value="missing">Missing</SelectItem>
								<SelectItem value="inconsistent">Inconsistent</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
							Ingestion Source
						</label>
						<Select value={ingestionFilter} onValueChange={onIngestionFilterChange}>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Sources</SelectItem>
								<SelectItem value="ok">OK</SelectItem>
								<SelectItem value="api_error">API Error</SelectItem>
								<SelectItem value="csv_error">CSV Error</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
							Sensor Type
						</label>
						<Select value={typeFilter} onValueChange={onTypeFilterChange}>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Types</SelectItem>
								{sensorTypeOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">Site</label>
						<Select value={siteFilter} onValueChange={onSiteFilterChange}>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Sites</SelectItem>
								{sites.map((site) => (
									<SelectItem key={site.id} value={site.id}>
										{site.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div>
						<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
							Equipment
						</label>
						<Select value={equipmentFilter} onValueChange={onEquipmentFilterChange}>
							<SelectTrigger className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Equipment</SelectItem>
								<SelectItem value="unassigned">Unassigned</SelectItem>
								{equipment.map((eq) => (
									<SelectItem key={eq.id} value={eq.id}>
										{eq.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{activeFiltersCount > 0 && (
						<div className="sm:col-span-2 lg:col-span-3 xl:col-span-6 flex justify-end">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									onHealthFilterChange("all");
									onQualityFilterChange("all");
									onIngestionFilterChange("all");
									onTypeFilterChange("all");
									onSiteFilterChange("all");
									onEquipmentFilterChange("all");
								}}
								className="h-8"
							>
								<X className="size-3 mr-1" />
								Clear Filters
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Table - continued in next edit */}
			<TableContent
				data={data}
				onViewDetails={onViewDetails}
				formatTimestamp={formatTimestamp}
				getHealthBadge={getHealthBadge}
				getQualityBadge={getQualityBadge}
				getIngestionBadge={getIngestionBadge}
			/>

			{/* Results Count */}
			<div className="text-sm text-muted-foreground">
				Showing {data.length} sensor{data.length !== 1 ? "s" : ""}
			</div>
		</div>
	);
}

// Extracted table component to keep main function cleaner
interface TableContentProps {
	data: SensorHealthData[];
	onViewDetails: (data: SensorHealthData) => void;
	formatTimestamp: (dateString?: string) => string;
	getHealthBadge: (status?: "healthy" | "stale" | "silent") => JSX.Element;
	getQualityBadge: (status?: "good" | "missing" | "inconsistent") => JSX.Element;
	getIngestionBadge: (status: "ok" | "api_error" | "csv_error") => JSX.Element;
}

function TableContent({
	data,
	onViewDetails,
	formatTimestamp,
	getHealthBadge,
	getQualityBadge,
	getIngestionBadge,
}: TableContentProps) {
	return (
		<div className="rounded-lg border bg-card overflow-x-auto">
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead className="w-[200px]">Sensor</TableHead>
						<TableHead className="w-[100px]">Type</TableHead>
						<TableHead className="w-[120px]">Site</TableHead>
						<TableHead className="w-[140px]">Equipment</TableHead>
						<TableHead className="w-[140px]">Last Reported</TableHead>
						<TableHead className="w-[100px]">Health</TableHead>
						<TableHead className="w-[120px]">Quality</TableHead>
						<TableHead className="w-[120px]">Ingestion</TableHead>
						<TableHead>Issues</TableHead>
						<TableHead className="w-[80px] text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((item) => (
						<TableRow
							key={item.sensor.id}
							className={cn(
								"cursor-pointer hover:bg-muted/50",
								item.health?.healthStatus === "silent" && "bg-red-50/30",
								item.health?.healthStatus === "stale" && "bg-amber-50/30",
							)}
							onClick={() => onViewDetails(item)}
						>
							<TableCell>
								<div>
									<p className="font-medium text-foreground">{item.sensor.name}</p>
									<p className="text-xs text-muted-foreground font-mono">{item.sensor.id}</p>
								</div>
							</TableCell>
							<TableCell>
								<Badge variant="outline" className="capitalize">
									{item.sensor.type}
								</Badge>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-1.5">
									<MapPin className="size-3.5 text-muted-foreground" />
									<span className="text-sm">{item.sensor.siteName || "Unknown"}</span>
								</div>
							</TableCell>
							<TableCell>
								<span className="text-sm text-muted-foreground">
									{item.sensor.equipmentName || "Unassigned"}
								</span>
							</TableCell>
							<TableCell>
								<p className="text-xs text-muted-foreground">
									{formatTimestamp(item.health?.lastReportedAt)}
								</p>
							</TableCell>
							<TableCell>{getHealthBadge(item.health?.healthStatus)}</TableCell>
							<TableCell>{getQualityBadge(item.quality?.qualityStatus)}</TableCell>
							<TableCell>{getIngestionBadge(item.ingestionStatus)}</TableCell>
							<TableCell>
								<p className="text-xs text-muted-foreground max-w-xs truncate">
									{item.issueSummary}
								</p>
							</TableCell>
							<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
								<Button
									variant="ghost"
									size="sm"
									onClick={() => onViewDetails(item)}
									className="h-8"
								>
									<Eye className="h-4 w-4" />
									<span className="sr-only">View details</span>
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}

export { SensorHealthTable, type SensorHealthTableProps };
