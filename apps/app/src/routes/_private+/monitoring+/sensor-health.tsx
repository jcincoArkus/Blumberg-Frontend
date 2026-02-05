import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { DashboardPanel } from "~@/ui";
import { useMonitoringSensorHealthViewModel } from "~@/view-model";
import { MonitoringSensorHealthTable, SensorHealthDetailsDrawer, SensorHealthKPIs } from "~@/views";

const SensorHealthPage = observer(function SensorHealthPage() {
	const vm = useMonitoringSensorHealthViewModel();

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-xl font-semibold text-foreground">{t`Sensor Health & Data Quality`}</h1>
				<p className="text-sm text-muted-foreground">
					{t`Monitor sensor health, data quality, and ingestion status. Identify technical issues affecting data reliability.`}
				</p>
			</div>

			{/* KPI Summary Cards */}
			<SensorHealthKPIs kpis={vm.kpis} />

			{/* Sensor Health Table */}
			<DashboardPanel
				title={t`Sensor Health & Quality Work Table`}
				description={t`Search and filter sensors by health status, data quality, ingestion source, site, equipment, or type`}
			>
				<MonitoringSensorHealthTable
					data={vm.sortedData}
					searchQuery={vm.searchQuery}
					onSearchChange={vm.setSearchQuery}
					healthFilter={vm.healthFilter}
					onHealthFilterChange={vm.setHealthFilter}
					qualityFilter={vm.qualityFilter}
					onQualityFilterChange={vm.setQualityFilter}
					ingestionFilter={vm.ingestionFilter}
					onIngestionFilterChange={vm.setIngestionFilter}
					typeFilter={vm.typeFilter}
					onTypeFilterChange={vm.setTypeFilter}
					siteFilter={vm.siteFilter}
					onSiteFilterChange={vm.setSiteFilter}
					equipmentFilter={vm.equipmentFilter}
					onEquipmentFilterChange={vm.setEquipmentFilter}
					timeWindow={vm.timeWindow}
					onTimeWindowChange={vm.setTimeWindow}
					sites={vm.monitoringSites}
					equipment={vm.monitoringEquipment}
					onViewDetails={vm.viewDetails}
				/>
			</DashboardPanel>

			{/* Sensor Details Drawer */}
			{vm.selectedSensor && (
				<SensorHealthDetailsDrawer
					data={vm.selectedSensor}
					open={vm.isDetailsOpen}
					onOpenChange={vm.setDetailsOpen}
					timeWindow={vm.timeWindow}
					onTimeWindowChange={vm.setTimeWindow}
				/>
			)}
		</div>
	);
});

export default SensorHealthPage;
