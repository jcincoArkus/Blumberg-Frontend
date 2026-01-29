import { RotateCcw } from "lucide-react";

import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~@/ui";

interface Site {
	id: string;
	name: string;
}

interface SensorHealthFiltersProps {
	statusFilter: string;
	setStatusFilter: (value: string) => void;
	siteFilter: string;
	setSiteFilter: (value: string) => void;
	typeFilter: string;
	setTypeFilter: (value: string) => void;
	sites: Site[];
	sensorTypes: string[];
}

export function SensorHealthFilters({
	statusFilter,
	setStatusFilter,
	siteFilter,
	setSiteFilter,
	typeFilter,
	setTypeFilter,
	sites,
	sensorTypes,
}: SensorHealthFiltersProps) {
	const resetFilters = () => {
		setStatusFilter("all");
		setSiteFilter("all");
		setTypeFilter("all");
	};

	return (
		<div className="flex flex-wrap items-center gap-4" role="group" aria-label="Sensor filters">
			<div className="flex items-center gap-2">
				<label htmlFor="status-filter" className="text-sm font-medium text-muted-foreground">
					Status:
				</label>
				<Select value={statusFilter} onValueChange={setStatusFilter}>
					<SelectTrigger id="status-filter" className="w-[140px]">
						<SelectValue placeholder="All Status" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Status</SelectItem>
						<SelectItem value="active">Active</SelectItem>
						<SelectItem value="offline">Offline</SelectItem>
						<SelectItem value="warning">Warning</SelectItem>
						<SelectItem value="stale">Stale</SelectItem>
						<SelectItem value="error">Error</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div className="flex items-center gap-2">
				<label htmlFor="site-filter" className="text-sm font-medium text-muted-foreground">
					Site:
				</label>
				<Select value={siteFilter} onValueChange={setSiteFilter}>
					<SelectTrigger id="site-filter" className="w-[180px]">
						<SelectValue placeholder="All Sites" />
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

			<div className="flex items-center gap-2">
				<label htmlFor="type-filter" className="text-sm font-medium text-muted-foreground">
					Type:
				</label>
				<Select value={typeFilter} onValueChange={setTypeFilter}>
					<SelectTrigger id="type-filter" className="w-[160px]">
						<SelectValue placeholder="All Types" />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">All Types</SelectItem>
						{sensorTypes.map((type) => (
							<SelectItem key={type} value={type}>
								{type.charAt(0).toUpperCase() + type.slice(1)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<Button variant="outline" size="sm" onClick={resetFilters}>
				<RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
				Reset Filters
			</Button>
		</div>
	);
}
