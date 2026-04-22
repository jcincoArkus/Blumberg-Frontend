import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { DashboardPanel } from "~@/ui";
import { useSensorHealthViewModel } from "~@/view-model";
import { SensorHealthFilters, SensorHealthStats, SensorHealthTable } from "~@/views";

const SensorHealthPage = observer(function SensorHealthPage() {
	const vm = useSensorHealthViewModel();

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-semibold text-foreground">{t`Sensor Health`}</h1>
				<p className="text-sm text-muted-foreground">
					{t`Monitor sensor status, battery levels, and connectivity across all sites`}
				</p>
			</div>

			{/* Health Stats */}
			<SensorHealthStats stats={vm.stats} />

			{/* Filters */}
			<DashboardPanel title={t`Filters`}>
				<SensorHealthFilters
					statusFilter={vm.statusFilter}
					setStatusFilter={vm.setStatusFilter}
					siteFilter={vm.siteFilter}
					setSiteFilter={vm.setSiteFilter}
					typeFilter={vm.typeFilter}
					setTypeFilter={vm.setTypeFilter}
					sites={vm.sites}
					sensorTypes={vm.sensorTypes}
				/>
			</DashboardPanel>

			{/* Sensors Table */}
			<DashboardPanel
				title={t`All Sensors`}
				description={t`Showing ${vm.filteredSensors.length} of ${vm.enrichedSensors.length} sensors`}
			>
				<SensorHealthTable sensors={vm.filteredSensors} isLoading={vm.isLoading} />
			</DashboardPanel>
		</div>
	);
});

export default SensorHealthPage;
