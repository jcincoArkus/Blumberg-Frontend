import type { SensorHealthDetailResponse } from "~@/api";

import type { QualityWindow, SensorHealthData } from "../types";

export interface SensorHealthDetailsDrawerProps {
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

export interface SensorHealthSectionProps {
	data: SensorHealthData;
	ageFormatted: string;
}

export interface DataQualitySectionProps {
	data: SensorHealthData;
	detail?: SensorHealthDetailResponse | undefined;
	detailLoading?: boolean;
	timeWindow: QualityWindow;
	onTimeWindowChange: (window: QualityWindow) => void;
}

export interface IngestionErrorsSectionProps {
	data: SensorHealthData;
	/** Per-sensor rejection count in last 24h (null = loading) */
	ingestionErrorCount?: number | null;
}
