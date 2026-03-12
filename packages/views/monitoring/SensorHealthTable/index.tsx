import { useState } from "react";

import { t } from "~@/i18n/macro";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "~@/ui";

import { EmptyState } from "./EmptyState";
import { FilterPanel } from "./FilterPanel";
import { SensorHealthTableRow } from "./SensorHealthTableRow";
import { TableToolbar } from "./TableToolbar";
import type { SensorHealthTableProps } from "./types";

export type { SensorHealthTableProps } from "./types";

export function SensorHealthTable({
	data,
	searchQuery,
	onSearchChange,
	healthFilter,
	onHealthFilterChange,
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

	const activeFiltersCount = [
		healthFilter !== "all",
		// qualityFilter !== "all",
		ingestionFilter !== "all",
		typeFilter !== "all",
		siteFilter !== "all",
		equipmentFilter !== "all",
	].filter(Boolean).length;

	if (data.length === 0) {
		return <EmptyState hasSearchOrFilters={searchQuery.length > 0 || activeFiltersCount > 0} />;
	}

	return (
		<div className="space-y-4">
			<TableToolbar
				searchQuery={searchQuery}
				onSearchChange={onSearchChange}
				timeWindow={timeWindow}
				onTimeWindowChange={onTimeWindowChange}
				onToggleFilters={() => setShowFilters(!showFilters)}
				activeFiltersCount={activeFiltersCount}
			/>

			{showFilters && (
				<FilterPanel
					healthFilter={healthFilter}
					onHealthFilterChange={onHealthFilterChange}
					// qualityFilter={qualityFilter}
					// onQualityFilterChange={onQualityFilterChange}
					ingestionFilter={ingestionFilter}
					onIngestionFilterChange={onIngestionFilterChange}
					typeFilter={typeFilter}
					onTypeFilterChange={onTypeFilterChange}
					siteFilter={siteFilter}
					onSiteFilterChange={onSiteFilterChange}
					equipmentFilter={equipmentFilter}
					onEquipmentFilterChange={onEquipmentFilterChange}
					sites={sites}
					equipment={equipment}
					activeFiltersCount={activeFiltersCount}
					onClearFilters={() => {
						onHealthFilterChange("all");
						// onQualityFilterChange("all");
						onIngestionFilterChange("all");
						onTypeFilterChange("all");
						onSiteFilterChange("all");
						onEquipmentFilterChange("all");
					}}
				/>
			)}

			<div className="rounded-lg border bg-card overflow-x-auto">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className="w-50">{t`Sensor`}</TableHead>
							<TableHead className="w-25">{t`Type`}</TableHead>
							<TableHead className="w-30">{t`Site`}</TableHead>
							<TableHead className="w-35">{t`Equipment`}</TableHead>
							<TableHead className="w-35">{t`Last Reported`}</TableHead>
							<TableHead className="w-25">{t`Health`}</TableHead>
							{/* <TableHead className="w-30">{t`Quality`}</TableHead> */}
							<TableHead className="w-30">{t`Ingestion`}</TableHead>
							<TableHead>{t`Issues`}</TableHead>
							<TableHead className="w-20 text-right">{t`Actions`}</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{data.map((item) => (
							<SensorHealthTableRow
								key={item.sensor.id}
								item={item}
								onViewDetails={onViewDetails}
							/>
						))}
					</TableBody>
				</Table>
			</div>

			<div className="text-sm text-muted-foreground">
				{data.length === 1 ? t`Showing 1 sensor` : t`Showing ${data.length} sensors`}
			</div>
		</div>
	);
}
