import { X } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~@/ui";

import type { Equipment, Site } from "../types";
import { SENSOR_TYPE_OPTIONS } from "./constants";

interface FilterPanelProps {
	healthFilter: string;
	onHealthFilterChange: (status: string) => void;
	// qualityFilter: string;
	// onQualityFilterChange: (status: string) => void;
	ingestionFilter: string;
	onIngestionFilterChange: (status: string) => void;
	typeFilter: string;
	onTypeFilterChange: (type: string) => void;
	siteFilter: string;
	onSiteFilterChange: (site: string) => void;
	equipmentFilter: string;
	onEquipmentFilterChange: (equipment: string) => void;
	sites: Site[];
	equipment: Equipment[];
	activeFiltersCount: number;
	onClearFilters: () => void;
}

export function FilterPanel({
	healthFilter,
	onHealthFilterChange,
	// qualityFilter,
	// onQualityFilterChange,
	ingestionFilter,
	onIngestionFilterChange,
	typeFilter,
	onTypeFilterChange,
	siteFilter,
	onSiteFilterChange,
	equipmentFilter,
	onEquipmentFilterChange,
	sites,
	equipment,
	activeFiltersCount,
	onClearFilters,
}: FilterPanelProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 p-4 border rounded-lg bg-muted/30">
			<div>
				<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
					{t`Health Status`}
				</label>
				<Select value={healthFilter} onValueChange={onHealthFilterChange}>
					<SelectTrigger className="h-8">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t`All Status`}</SelectItem>
						<SelectItem value="healthy">{t`Healthy`}</SelectItem>
						<SelectItem value="stale">{t`Stale`}</SelectItem>
						<SelectItem value="silent">{t`Silent`}</SelectItem>
						<SelectItem value="offline">{t`Offline`}</SelectItem>
						<SelectItem value="warning">{t`Warning`}</SelectItem>
						<SelectItem value="critical">{t`Critical`}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* <div>
				<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
					{t`Data Quality`}
				</label>
				<Select value={qualityFilter} onValueChange={onQualityFilterChange}>
					<SelectTrigger className="h-8">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t`All Quality`}</SelectItem>
						<SelectItem value="good">{t`Good`}</SelectItem>
						<SelectItem value="missing">{t`Missing`}</SelectItem>
						<SelectItem value="inconsistent">{t`Inconsistent`}</SelectItem>
					</SelectContent>
				</Select>
			</div> */}

			<div>
				<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
					{t`Ingestion Source`}
				</label>
				<Select value={ingestionFilter} onValueChange={onIngestionFilterChange}>
					<SelectTrigger className="h-8">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t`All Sources`}</SelectItem>
						<SelectItem value="api">{t`API`}</SelectItem>
						<SelectItem value="csv">{t`CSV`}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			<div>
				<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
					{t`Sensor Type`}
				</label>
				<Select value={typeFilter} onValueChange={onTypeFilterChange}>
					<SelectTrigger className="h-8">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="all">{t`All Types`}</SelectItem>
						{SENSOR_TYPE_OPTIONS.map((option) => (
							<SelectItem key={option.value} value={option.value}>
								{option.label}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<label className="text-xs font-medium text-muted-foreground mb-1.5 block">{t`Site`}</label>
				<Select value={siteFilter} onValueChange={onSiteFilterChange}>
					<SelectTrigger className="h-8">
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
				<label className="text-xs font-medium text-muted-foreground mb-1.5 block">
					{t`Equipment`}
				</label>
				<Select value={equipmentFilter} onValueChange={onEquipmentFilterChange}>
					<SelectTrigger className="h-8">
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
				<div className="sm:col-span-2 lg:col-span-3 xl:col-span-6 flex justify-end">
					<Button variant="ghost" size="sm" onClick={onClearFilters} className="h-8">
						<X className="size-3 mr-1" />
						{t`Clear Filters`}
					</Button>
				</div>
			)}
		</div>
	);
}
