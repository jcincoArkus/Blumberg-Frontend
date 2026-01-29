import { Plus } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "~@/ui";
import {
	type ConfigEquipment,
	type ConfigSensor,
	ConfigSensorsTable,
	type ConfigSite,
	SensorDetailsDrawer,
	SensorEditor,
} from "~@/views";

import {
	equipment,
	getAllSensorsEnriched,
	getEquipmentBySite,
	getUnitForSensorType,
	sensorTypeOptions,
	sites,
	transformTypeOptions,
} from "../../../mock-data/sensors";

export default function SensorsConfigPage() {
	const [sensors, setSensors] = useState<ConfigSensor[]>(getAllSensorsEnriched);
	const [selectedSensor, setSelectedSensor] = useState<ConfigSensor | null>(null);
	const [editingSensor, setEditingSensor] = useState<ConfigSensor | null>(null);
	const [isEditorOpen, setIsEditorOpen] = useState(false);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

	// Filter state
	const [searchQuery, setSearchQuery] = useState("");
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [typeFilter, setTypeFilter] = useState<string>("all");
	const [siteFilter, setSiteFilter] = useState<string>("all");
	const [equipmentFilter, setEquipmentFilter] = useState<string>("all");

	// Filtered sensors
	const filteredSensors = useMemo(() => {
		return sensors.filter((sensor) => {
			// Search filter
			const matchesSearch =
				searchQuery === "" ||
				sensor.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sensor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sensor.siteName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sensor.equipmentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
				sensor.type.toLowerCase().includes(searchQuery.toLowerCase());

			// Status filter
			const matchesStatus = statusFilter === "all" || sensor.status === statusFilter;

			// Type filter
			const matchesType = typeFilter === "all" || sensor.type === typeFilter;

			// Site filter
			const matchesSite = siteFilter === "all" || sensor.siteId === siteFilter;

			// Equipment filter
			const matchesEquipment =
				equipmentFilter === "all" ||
				(equipmentFilter === "unassigned" && !sensor.equipmentId) ||
				sensor.equipmentId === equipmentFilter;

			return matchesSearch && matchesStatus && matchesType && matchesSite && matchesEquipment;
		});
	}, [sensors, searchQuery, statusFilter, typeFilter, siteFilter, equipmentFilter]);

	const handleCreate = () => {
		setEditingSensor(null);
		setIsEditorOpen(true);
	};

	const handleEdit = (sensor: ConfigSensor) => {
		setEditingSensor(sensor);
		setIsEditorOpen(true);
	};

	const handleViewDetails = (sensor: ConfigSensor) => {
		setSelectedSensor(sensor);
		setIsDetailsOpen(true);
	};

	const handleSave = (sensor: ConfigSensor) => {
		if (editingSensor) {
			setSensors((prev) => prev.map((s) => (s.id === sensor.id ? sensor : s)));
		} else {
			setSensors((prev) => [...prev, sensor]);
		}
		setIsEditorOpen(false);
		setEditingSensor(null);
	};

	const handleToggleStatus = (id: string, status: string) => {
		setSensors((prev) =>
			prev.map((s) => (s.id === id ? { ...s, status: status as ConfigSensor["status"] } : s)),
		);
		// Also update selected sensor if viewing details
		if (selectedSensor?.id === id) {
			setSelectedSensor((prev) =>
				prev ? { ...prev, status: status as ConfigSensor["status"] } : null,
			);
		}
	};

	const handleClearFilters = () => {
		setSearchQuery("");
		setStatusFilter("all");
		setTypeFilter("all");
		setSiteFilter("all");
		setEquipmentFilter("all");
	};

	return (
		<div className="container py-6">
			<div className="mb-6 flex items-center justify-between">
				<div>
					<h1 className="text-2xl font-semibold tracking-tight">Sensor Management</h1>
					<p className="text-muted-foreground text-sm">
						Register, configure, and manage sensors across all sites.
					</p>
				</div>
				<Button onClick={handleCreate}>
					<Plus className="mr-2 h-4 w-4" />
					Register Sensor
				</Button>
			</div>

			<ConfigSensorsTable
				sensors={filteredSensors}
				sites={sites as ConfigSite[]}
				equipment={equipment as ConfigEquipment[]}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				statusFilter={statusFilter}
				onStatusFilterChange={setStatusFilter}
				typeFilter={typeFilter}
				onTypeFilterChange={setTypeFilter}
				siteFilter={siteFilter}
				onSiteFilterChange={setSiteFilter}
				equipmentFilter={equipmentFilter}
				onEquipmentFilterChange={setEquipmentFilter}
				onClearFilters={handleClearFilters}
				onViewDetails={handleViewDetails}
				onEdit={handleEdit}
				onToggleStatus={handleToggleStatus}
			/>

			<SensorEditor
				open={isEditorOpen}
				onOpenChange={setIsEditorOpen}
				sensor={editingSensor}
				onSave={handleSave}
				sites={sites as ConfigSite[]}
				equipment={equipment as ConfigEquipment[]}
				sensorTypeOptions={sensorTypeOptions}
				transformTypeOptions={transformTypeOptions}
				getEquipmentBySite={getEquipmentBySite}
				getUnitForSensorType={getUnitForSensorType}
			/>

			{selectedSensor && (
				<SensorDetailsDrawer
					sensor={selectedSensor}
					open={isDetailsOpen}
					onOpenChange={setIsDetailsOpen}
					onEdit={handleEdit}
					onToggleStatus={handleToggleStatus}
				/>
			)}
		</div>
	);
}
