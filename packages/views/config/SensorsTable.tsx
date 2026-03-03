import {
	CheckCircle2,
	Edit,
	Eye,
	Filter,
	MapPin,
	MoreHorizontal,
	Search,
	SlidersHorizontal,
	X,
	XCircle,
} from "lucide-react";
import { useState } from "react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	cn,
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Switch,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import type { Equipment, Sensor, SensorType, Site } from "./types";

const getSensorTypeOptions = (): { value: SensorType; label: string }[] => [
	{ value: "temperature", label: t`Temperature` },
	{ value: "humidity", label: t`Humidity` },
	{ value: "co2", label: t`CO2` },
	{ value: "o2", label: t`O2` },
	{ value: "pressure", label: t`Pressure` },
	{ value: "energy", label: t`Energy` },
];

interface SensorsTableProps {
	sensors: Sensor[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
	statusFilter: string;
	onStatusFilterChange: (status: string) => void;
	typeFilter: string;
	onTypeFilterChange: (type: string) => void;
	siteFilter: string;
	onSiteFilterChange: (site: string) => void;
	equipmentFilter: string;
	onEquipmentFilterChange: (equipment: string) => void;
	sites: Site[];
	equipment: Equipment[];
	onViewDetails: (sensor: Sensor) => void;
	onEdit: (sensor: Sensor) => void;
	onSetThreshold: (sensor: Sensor) => void;
	onToggleStatus: (id: string, status: string) => void;
}

function formatTimestamp(dateString?: string): string {
	if (!dateString) return t`Never`;
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

const getStatusConfig = () =>
	({
		active: { label: t`Active`, className: "bg-emerald-50 text-emerald-700 border-emerald-300" },
		inactive: { label: t`Inactive`, className: "bg-slate-50 text-slate-700 border-slate-300" },
		warning: { label: t`Warning`, className: "bg-amber-50 text-amber-700 border-amber-300" },
		stale: { label: t`Stale`, className: "bg-orange-50 text-orange-700 border-orange-300" },
		offline: { label: t`Offline`, className: "bg-red-50 text-red-700 border-red-300" },
		error: { label: t`Error`, className: "bg-red-50 text-red-700 border-red-300" },
	}) as Record<string, { label: string; className: string }>;

function _getStatusBadge(status: string): React.ReactNode {
	const config = getStatusConfig();
	const cfg = config[status] || config.inactive;
	return (
		<Badge variant="outline" className={cn("border", cfg.className)}>
			{cfg.label}
		</Badge>
	);
}

export function SensorsTable({
	sensors,
	searchQuery,
	onSearchChange,
	statusFilter,
	onStatusFilterChange,
	typeFilter,
	onTypeFilterChange,
	siteFilter,
	onSiteFilterChange,
	equipmentFilter,
	onEquipmentFilterChange,
	sites,
	equipment,
	onViewDetails,
	onEdit,
	onSetThreshold,
	onToggleStatus,
}: SensorsTableProps) {
	const [showFilters, setShowFilters] = useState(false);

	const isMapped = (sensor: Sensor) => sensor.dataMapping && sensor.dataMapping.length > 0;

	const activeFiltersCount = [
		statusFilter !== "all",
		typeFilter !== "all",
		siteFilter !== "all",
		equipmentFilter !== "all",
	].filter(Boolean).length;

	const sensorTypeOptions = getSensorTypeOptions();

	if (sensors.length === 0) {
		return (
			<div className="py-12 text-center">
				<div className="flex justify-center mb-4">
					<div className="size-16 rounded-full bg-muted flex items-center justify-center">
						<XCircle className="size-8 text-muted-foreground" />
					</div>
				</div>
				<p className="text-sm font-medium text-foreground mb-1">{t`No sensors found`}</p>
				<p className="text-xs text-muted-foreground">
					{searchQuery || activeFiltersCount > 0
						? t`Try adjusting your search or filters`
						: t`Register your first sensor to get started`}
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
						placeholder={t`Search by sensor ID, name, site, equipment, or type...`}
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						className="pl-9"
						aria-label={t`Search sensors`}
					/>
				</div>
				<Button
					variant="outline"
					onClick={() => setShowFilters(!showFilters)}
					className="sm:w-auto"
					aria-expanded={showFilters}
					aria-controls="filter-panel"
				>
					<Filter className="size-4 mr-2" />
					{t`Filters`}
					{activeFiltersCount > 0 && (
						<Badge variant="secondary" className="ml-2 h-5 min-w-5 px-1.5 text-xs">
							{activeFiltersCount}
						</Badge>
					)}
				</Button>
			</div>

			{/* Filter Panel */}
			{showFilters && (
				<div
					id="filter-panel"
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 border rounded-lg bg-muted/30"
					role="region"
					aria-label={t`Filter options`}
				>
					<div>
						<label
							htmlFor="status-filter"
							className="text-xs font-medium text-muted-foreground mb-1.5 block"
						>
							{t`Status`}
						</label>
						<Select value={statusFilter} onValueChange={onStatusFilterChange}>
							<SelectTrigger id="status-filter" className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Status`}</SelectItem>
								<SelectItem value="active">{t`Active`}</SelectItem>
								<SelectItem value="inactive">{t`Inactive`}</SelectItem>
								<SelectItem value="warning">{t`Warning`}</SelectItem>
								<SelectItem value="offline">{t`Offline`}</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<label
							htmlFor="type-filter"
							className="text-xs font-medium text-muted-foreground mb-1.5 block"
						>
							{t`Sensor Type`}
						</label>
						<Select value={typeFilter} onValueChange={onTypeFilterChange}>
							<SelectTrigger id="type-filter" className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Types`}</SelectItem>
								{sensorTypeOptions.map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<label
							htmlFor="site-filter"
							className="text-xs font-medium text-muted-foreground mb-1.5 block"
						>
							{t`Site`}
						</label>
						<Select value={siteFilter} onValueChange={onSiteFilterChange}>
							<SelectTrigger id="site-filter" className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Sites`}</SelectItem>
								{sites.map((site) => (
									<SelectItem key={site.id} value={site.id}>
										{site.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<div>
						<label
							htmlFor="equipment-filter"
							className="text-xs font-medium text-muted-foreground mb-1.5 block"
						>
							{t`Equipment`}
						</label>
						<Select value={equipmentFilter} onValueChange={onEquipmentFilterChange}>
							<SelectTrigger id="equipment-filter" className="h-8">
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Equipment`}</SelectItem>
								<SelectItem value="unassigned">{t`Unassigned`}</SelectItem>
								{equipment.map((eq) => (
									<SelectItem key={eq.id} value={eq.id}>
										{eq.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					{activeFiltersCount > 0 && (
						<div className="sm:col-span-2 lg:col-span-4 flex justify-end">
							<Button
								variant="ghost"
								size="sm"
								onClick={() => {
									onStatusFilterChange("all");
									onTypeFilterChange("all");
									onSiteFilterChange("all");
									onEquipmentFilterChange("all");
								}}
								className="h-8"
							>
								<X className="size-3 mr-1" />
								{t`Clear Filters`}
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Table */}
			<div className="rounded-lg border bg-card">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-12.5">{t`Status`}</TableHead>
							<TableHead>{t`Sensor Name / ID`}</TableHead>
							<TableHead>{t`Type`}</TableHead>
							<TableHead>{t`Site`}</TableHead>
							<TableHead>{t`Equipment`}</TableHead>
							<TableHead>{t`Last Seen`}</TableHead>
							<TableHead className="text-center">{t`Mapping`}</TableHead>
							<TableHead className="w-25 text-right">{t`Actions`}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sensors.map((sensor) => (
							<TableRow
								key={sensor.id}
								className={cn(
									"cursor-pointer hover:bg-muted/50",
									sensor.status === "inactive" && "opacity-60",
								)}
								onClick={() => onViewDetails(sensor)}
							>
								<TableCell>
									<Switch
										checked={sensor.status === "active"}
										onCheckedChange={(checked) =>
											onToggleStatus(sensor.id, checked ? "active" : "inactive")
										}
										onClick={(e) => e.stopPropagation()}
										aria-label={t`Toggle ${sensor.name} status`}
									/>
								</TableCell>
								<TableCell>
									<div>
										<p className="font-medium text-foreground">{sensor.name}</p>
										<p className="text-xs text-muted-foreground font-mono">{sensor.id}</p>
									</div>
								</TableCell>
								<TableCell>
									<Badge variant="outline" className="capitalize">
										{sensor.type}
									</Badge>
								</TableCell>
								<TableCell>
									<div className="flex items-center gap-1.5">
										<MapPin className="size-3.5 text-muted-foreground" />
										<span className="text-sm">{sensor.siteName || t`Unknown`}</span>
									</div>
								</TableCell>
								<TableCell>
									<span className="text-sm text-muted-foreground">
										{sensor.equipmentName || t`Unassigned`}
									</span>
								</TableCell>
								<TableCell>
									<p className="text-xs text-muted-foreground">
										{formatTimestamp(sensor.lastSeen)}
									</p>
								</TableCell>
								<TableCell className="text-center">
									{isMapped(sensor) ? (
										<Badge
											variant="outline"
											className="bg-emerald-50 text-emerald-700 border-emerald-300"
										>
											<CheckCircle2 className="size-3 mr-1" />
											{t`Mapped`}
										</Badge>
									) : (
										<Badge
											variant="outline"
											className="bg-amber-50 text-amber-700 border-amber-300"
										>
											<XCircle className="size-3 mr-1" />
											{t`Unmapped`}
										</Badge>
									)}
								</TableCell>
								<TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<Button variant="ghost" size="sm" className="h-8 w-8 p-0">
												<MoreHorizontal className="h-4 w-4" />
												<span className="sr-only">{t`Open menu for ${sensor.name}`}</span>
											</Button>
										</DropdownMenuTrigger>
										<DropdownMenuContent align="end">
											<DropdownMenuItem onClick={() => onViewDetails(sensor)}>
												<Eye className="mr-2 h-4 w-4" />
												{t`View Details`}
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => onEdit(sensor)}>
												<Edit className="mr-2 h-4 w-4" />
												{t`Edit`}
											</DropdownMenuItem>
											<DropdownMenuItem onClick={() => onSetThreshold(sensor)}>
												<SlidersHorizontal className="mr-2 h-4 w-4" />
												{t`Set Threshold`}
											</DropdownMenuItem>
										</DropdownMenuContent>
									</DropdownMenu>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

			{/* Results Count */}
			<div className="text-sm text-muted-foreground">
				{t`Showing ${sensors.length} sensor${sensors.length !== 1 ? "s" : ""}`}
			</div>
		</div>
	);
}
