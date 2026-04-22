import { Plus } from "lucide-react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { sensorThresholdSeverityOptions, sensorThresholdTimeOptions } from "~@/mock-data";
import { Button } from "~@/ui";
import { useSensorsConfigViewModel } from "~@/view-model";
import {
	ConfigSensorsTable,
	SensorDetailsDrawer,
	SensorEditor,
	SensorThresholdEditor,
} from "~@/views";

/**
 * Sensors Configuration page component.
 * Uses SensorsConfigViewModel for all state management and filtering.
 */
const SensorsConfigPage = observer(function SensorsConfigPage() {
	const vm = useSensorsConfigViewModel();

	return (
		<div className="container py-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">{t`Sensor Management`}</h1>
					<p className="text-muted-foreground text-sm">
						{t`Register, configure, and manage sensors across all sites.`}
					</p>
				</div>
				<Button onClick={() => vm.openEditor(null)}>
					<Plus className="mr-2 h-4 w-4" />
					{t`Register Sensor`}
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
				onViewDetails={vm.viewDetails}
				onEdit={vm.openEditor}
				onSetThreshold={vm.openThresholdEditor}
				onToggleStatus={vm.toggleSensorStatus}
			/>

			<SensorEditor
				open={vm.isEditorOpen}
				onOpenChange={(open) => !open && vm.closeEditor()}
				sensor={vm.editingSensor}
				onSave={vm.saveSensor}
				sites={vm.sites}
				equipment={vm.equipment}
				sensorTypeOptions={vm.sensorTypeOptions}
				transformTypeOptions={vm.transformTypeOptions}
				getEquipmentBySite={vm.getEquipmentBySite}
				getUnitForSensorType={vm.getUnitForSensorType}
			/>

			{vm.selectedSensor && (
				<SensorDetailsDrawer
					sensor={vm.selectedSensor}
					open={vm.isDetailsOpen}
					onOpenChange={(open) => !open && vm.closeDetails()}
					onEdit={vm.openEditor}
					onSetThreshold={vm.openThresholdEditor}
					onToggleStatus={vm.toggleSensorStatus}
				/>
			)}

			<SensorThresholdEditor
				open={vm.isThresholdEditorOpen}
				onOpenChange={(open) => !open && vm.closeThresholdEditor()}
				threshold={vm.editingThreshold}
				onSave={vm.saveThreshold}
				sensors={vm.sensors}
				sensorId={vm.thresholdSensorId ?? undefined}
				severityOptions={sensorThresholdSeverityOptions}
				timeOptions={sensorThresholdTimeOptions}
			/>
		</div>
	);
});

export default SensorsConfigPage;
