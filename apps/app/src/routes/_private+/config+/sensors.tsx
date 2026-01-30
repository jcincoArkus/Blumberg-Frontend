import { Plus } from "lucide-react";

import { observer } from "~@/mobx";
import { Button } from "~@/ui";
import { useSensorsConfigViewModel } from "~@/view-model";
import type { ConfigEquipment, ConfigSensor, ConfigSite } from "~@/views";
import { ConfigSensorsTable, SensorDetailsDrawer, SensorEditor } from "~@/views";

import {
	equipment,
	getAllSensorsEnriched,
	getEquipmentBySite,
	getUnitForSensorType,
	sensorTypeOptions,
	sites,
	transformTypeOptions,
} from "../../../mock-data/sensors";

/**
 * Sensors Configuration page component.
 * Uses SensorsConfigViewModel for all state management and filtering.
 */
const SensorsConfigPage = observer(function SensorsConfigPage() {
	const vm = useSensorsConfigViewModel({
		sensors: getAllSensorsEnriched(),
		sites: sites as ConfigSite[],
		equipment: equipment as ConfigEquipment[],
	});

	return (
		<div className="container py-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Sensor Management</h1>
					<p className="text-muted-foreground text-sm">
						Register, configure, and manage sensors across all sites.
					</p>
				</div>
				<Button onClick={() => vm.openEditor(null)}>
					<Plus className="mr-2 h-4 w-4" />
					Register Sensor
				</Button>
			</div>

			<ConfigSensorsTable
				sensors={vm.filteredSensors}
				sites={vm.sites}
				equipment={vm.equipment}
				searchQuery={vm.searchQuery}
				onSearchChange={vm.setSearchQuery}
				statusFilter={vm.statusFilter}
				onStatusFilterChange={vm.setStatusFilter}
				typeFilter={vm.typeFilter}
				onTypeFilterChange={vm.setTypeFilter}
				siteFilter={vm.siteFilter}
				onSiteFilterChange={vm.setSiteFilter}
				equipmentFilter={vm.equipmentFilter}
				onEquipmentFilterChange={vm.setEquipmentFilter}
				onClearFilters={vm.clearFilters}
				onViewDetails={vm.viewDetails}
				onEdit={vm.openEditor}
				onToggleStatus={vm.toggleSensorStatus}
			/>

			<SensorEditor
				open={vm.isEditorOpen}
				onOpenChange={(open) => !open && vm.closeEditor()}
				sensor={vm.editingSensor}
				onSave={vm.saveSensor}
				sites={vm.sites}
				equipment={vm.equipment}
				sensorTypeOptions={sensorTypeOptions}
				transformTypeOptions={transformTypeOptions}
				getEquipmentBySite={getEquipmentBySite}
				getUnitForSensorType={getUnitForSensorType}
			/>

			{vm.selectedSensor && (
				<SensorDetailsDrawer
					sensor={vm.selectedSensor}
					open={vm.isDetailsOpen}
					onOpenChange={(open) => !open && vm.closeDetails()}
					onEdit={vm.openEditor}
					onToggleStatus={vm.toggleSensorStatus}
				/>
			)}
		</div>
	);
});

export default SensorsConfigPage;
