import type { Equipment, QualityWindow, SensorHealthData, Site } from "../types";

export interface SensorHealthTableProps {
	data: SensorHealthData[];
	searchQuery: string;
	onSearchChange: (query: string) => void;
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
	timeWindow: QualityWindow;
	onTimeWindowChange: (window: QualityWindow) => void;
	sites: Site[];
	equipment: Equipment[];
	onViewDetails: (data: SensorHealthData) => void;
}
