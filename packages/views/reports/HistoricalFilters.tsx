import { t } from "~@/i18n/macro";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Switch,
} from "~@/ui";

import type { DateRangePreset, Equipment, Site } from "./types";

const getSensorTypeOptions = () => [
	{ value: "temperature", label: t`Temperature` },
	{ value: "humidity", label: t`Humidity` },
	{ value: "energy", label: t`Energy` },
	{ value: "pressure", label: t`Pressure` },
];

interface HistoricalFiltersProps {
	datePreset: DateRangePreset;
	onDatePresetChange: (preset: DateRangePreset) => void;
	startDate: Date | null;
	onStartDateChange: (date: Date | null) => void;
	endDate: Date | null;
	onEndDateChange: (date: Date | null) => void;
	siteFilter: string;
	onSiteFilterChange: (site: string) => void;
	equipmentFilter: string;
	onEquipmentFilterChange: (equipment: string) => void;
	sensorTypeFilter: string;
	onSensorTypeFilterChange: (type: string) => void;
	severityFilter: string;
	onSeverityFilterChange: (severity: string) => void;
	comparePrevious: boolean;
	onComparePreviousChange: (compare: boolean) => void;
	sites: Site[];
	equipment: Equipment[];
}

export function HistoricalFilters({
	datePreset,
	onDatePresetChange,
	startDate,
	onStartDateChange,
	endDate,
	onEndDateChange,
	siteFilter,
	onSiteFilterChange,
	equipmentFilter,
	onEquipmentFilterChange,
	sensorTypeFilter,
	onSensorTypeFilterChange,
	severityFilter,
	onSeverityFilterChange,
	comparePrevious,
	onComparePreviousChange,
	sites,
	equipment,
}: HistoricalFiltersProps) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>{t`Filters`}</CardTitle>
				<CardDescription>{t`Apply filters to all views in this module`}</CardDescription>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
					{/* Date Range */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-muted-foreground">{t`Date Range`}</label>
						<Select
							value={datePreset}
							onValueChange={(value) => onDatePresetChange(value as DateRangePreset)}
						>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="24h">{t`Last 24h`}</SelectItem>
								<SelectItem value="7d">{t`Last 7d`}</SelectItem>
								<SelectItem value="30d">{t`Last 30d`}</SelectItem>
								<SelectItem value="custom">{t`Custom`}</SelectItem>
							</SelectContent>
						</Select>
					</div>

					{datePreset === "custom" && (
						<>
							<div className="space-y-2">
								<label className="text-xs font-medium text-muted-foreground">{t`Start Date`}</label>
								<Input
									type="date"
									value={startDate ? startDate.toISOString().split("T")[0] : ""}
									onChange={(e) =>
										onStartDateChange(e.target.value ? new Date(e.target.value) : null)
									}
								/>
							</div>
							<div className="space-y-2">
								<label className="text-xs font-medium text-muted-foreground">{t`End Date`}</label>
								<Input
									type="date"
									value={endDate ? endDate.toISOString().split("T")[0] : ""}
									onChange={(e) =>
										onEndDateChange(e.target.value ? new Date(e.target.value) : null)
									}
								/>
							</div>
						</>
					)}

					{/* Site Filter */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-muted-foreground">{t`Site`}</label>
						<Select value={siteFilter} onValueChange={onSiteFilterChange}>
							<SelectTrigger>
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

					{/* Equipment Filter */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-muted-foreground">{t`Equipment`}</label>
						<Select value={equipmentFilter} onValueChange={onEquipmentFilterChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Equipment`}</SelectItem>
								{equipment.map((eq) => (
									<SelectItem key={eq.id} value={eq.id}>
										{eq.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Sensor Type Filter */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-muted-foreground">{t`Sensor Type`}</label>
						<Select value={sensorTypeFilter} onValueChange={onSensorTypeFilterChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Types`}</SelectItem>
								{getSensorTypeOptions().map((option) => (
									<SelectItem key={option.value} value={option.value}>
										{option.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{/* Severity Filter */}
					<div className="space-y-2">
						<label className="text-xs font-medium text-muted-foreground">{t`Severity`}</label>
						<Select value={severityFilter} onValueChange={onSeverityFilterChange}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">{t`All Severities`}</SelectItem>
								<SelectItem value="critical">{t`Critical`}</SelectItem>
								<SelectItem value="high">{t`High`}</SelectItem>
								<SelectItem value="medium">{t`Medium`}</SelectItem>
								<SelectItem value="low">{t`Low`}</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Compare Previous Period */}
				<div className="flex items-center justify-between rounded-lg border p-4">
					<div className="space-y-0.5">
						<label className="text-sm font-medium">{t`Compare to Previous Period`}</label>
						<p className="text-xs text-muted-foreground">
							{t`Overlay previous period trend for comparison`}
						</p>
					</div>
					<Switch checked={comparePrevious} onCheckedChange={onComparePreviousChange} />
				</div>
			</CardContent>
		</Card>
	);
}
