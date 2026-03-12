import { useState } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { DashboardPanel } from "~@/ui";
import { useMonitoringSensorHealthViewModel } from "~@/view-model";
import type { SensorHealthData } from "~@/views";
import { MonitoringSensorHealthTable, SensorHealthDetailsDrawer, SensorHealthKPIs } from "~@/views";

const SensorHealthPage = observer(function SensorHealthPage() {
	const vm = useMonitoringSensorHealthViewModel();
	const [selectedSensor, setSelectedSensor] = useState<SensorHealthData | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	const handleViewDetails = (data: SensorHealthData) => {
		setSelectedSensor(data);
		setIsDetailsOpen(true);
		vm.loadDetailFor(data.sensor.id);
	};

	const handleDetailsOpenChange = (open: boolean) => {
		setIsDetailsOpen(open);
		if (!open) setSelectedSensor(null);
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				{/* <h1 className="text-xl font-semibold text-foreground">{t`Sensor Health & Data Quality`}</h1> */}
				<h1 className="text-xl font-semibold text-foreground">{t`Sensor Health`}</h1>
				<p className="text-sm text-muted-foreground">
					{/* {t`Monitor sensor health, data quality, and ingestion status. Identify technical issues affecting data reliability.`} */}
					{t`Monitor sensor health and ingestion status. Identify technical issues affecting data reliability.`}
				</p>
			</div>

			{/* KPI Summary Cards */}
			<SensorHealthKPIs kpis={vm.kpis} />

			{/* Sensor Health Table */}
			<DashboardPanel
				title={t`Sensor Health Work Table`}
				description={t`Search and filter sensors by health status, ingestion source, site, equipment, or type`}
			>
				<MonitoringSensorHealthTable
					data={vm.sortedData}
					searchQuery={vm.searchQuery}
					onSearchChange={vm.setSearchQuery}
					healthFilter={vm.healthFilter}
					onHealthFilterChange={vm.setHealthFilter}
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
					onViewDetails={handleViewDetails}
				/>
			</DashboardPanel>

			{/* Sensor Details Drawer — local UI state (selected row + open) */}
			{selectedSensor && (
				<SensorHealthDetailsDrawer
					data={selectedSensor}
					detail={vm.getDetailFor(selectedSensor.sensor.id)}
					detailLoading={vm.isDetailLoading}
					ingestionErrorCount={vm.getRejectionCountFor(selectedSensor.sensor.id)}
					open={isDetailsOpen}
					onOpenChange={handleDetailsOpenChange}
					timeWindow={vm.timeWindow}
					onTimeWindowChange={vm.setTimeWindow}
				/>
			)}
		</div>
	);
});

export default SensorHealthPage;
