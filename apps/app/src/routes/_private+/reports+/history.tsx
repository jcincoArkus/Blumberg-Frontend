import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { siteEquipment as equipment, siteData as sites } from "~@/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";
import { useHistoricalReportsViewModel } from "~@/view-model";
import { AlertsHistoryTab, HistoricalFilters, ReadingsHistoryTab } from "~@/views";

const HistoricalReportsPage = observer(function HistoricalReportsPage() {
	const vm = useHistoricalReportsViewModel();

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-xl font-semibold text-foreground">{t`Historical Data & Reporting`}</h1>
				<p className="text-sm text-muted-foreground">
					{t`Retrospective analysis of system behavior. Answer: "Has this happened before?" and "Is the situation getting better or worse over time?"`}
				</p>
			</div>

			{/* Global Filters */}
			<HistoricalFilters
				datePreset={vm.datePreset}
				onDatePresetChange={vm.setDatePreset}
				startDate={vm.startDate}
				onStartDateChange={vm.setStartDate}
				endDate={vm.endDate}
				onEndDateChange={vm.setEndDate}
				siteFilter={vm.siteFilter}
				onSiteFilterChange={vm.setSiteFilter}
				equipmentFilter={vm.equipmentFilter}
				onEquipmentFilterChange={vm.setEquipmentFilter}
				sensorTypeFilter={vm.sensorTypeFilter}
				onSensorTypeFilterChange={vm.setSensorTypeFilter}
				severityFilter={vm.severityFilter}
				onSeverityFilterChange={vm.setSeverityFilter}
				comparePrevious={vm.comparePrevious}
				onComparePreviousChange={vm.setComparePrevious}
				sites={sites}
				equipment={equipment}
			/>

			{/* Tabs */}
			<Tabs value={vm.activeTab} onValueChange={vm.setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="readings">{t`Readings History`}</TabsTrigger>
					<TabsTrigger value="alerts">{t`Alerts History`}</TabsTrigger>
				</TabsList>

				<TabsContent value="readings" className="space-y-6">
					<ReadingsHistoryTab
						readings={vm.readings}
						previousReadings={vm.previousReadings}
						comparePrevious={vm.comparePrevious}
					/>
				</TabsContent>

				<TabsContent value="alerts" className="space-y-6">
					<AlertsHistoryTab
						alerts={vm.alerts}
						previousAlerts={vm.previousAlerts}
						comparePrevious={vm.comparePrevious}
						equipment={equipment}
					/>
				</TabsContent>
			</Tabs>
		</div>
	);
});

export default HistoricalReportsPage;
