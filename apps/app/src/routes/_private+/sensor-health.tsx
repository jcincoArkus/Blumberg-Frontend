import { useMemo, useState } from "react";

import {
	siteEquipment as equipment,
	getSiteDataById as getSiteById,
	siteSensors,
	siteData as sites,
} from "~@/mock-data";
import {
	DashboardPanel,
	SensorHealthFilters,
	SensorHealthStats,
	SensorHealthTable,
} from "~@/views";

// Enrich sensors with additional data for the health table
function enrichSensors() {
	return siteSensors.map((sensor) => {
		const eq = equipment.find((e) => e.id === sensor.equipmentId);
		const site = getSiteById(sensor.siteId);

		// Generate mock values based on sensor type
		const typeConfig: Record<string, { value: number; unit: string }> = {
			temperature: { value: Math.round((Math.random() * 30 - 10) * 10) / 10, unit: "°C" },
			humidity: { value: Math.round(Math.random() * 60 + 30), unit: "%" },
			energy: { value: Math.round(Math.random() * 15 * 10) / 10, unit: "kW" },
			pressure: { value: Math.round(Math.random() * 50 + 100), unit: "PSI" },
		};

		const config = typeConfig[sensor.type] || { value: 0, unit: "" };

		return {
			...sensor,
			equipmentName: eq?.name || "Unknown",
			siteName: site?.name || "Unknown",
			value: config.value,
			unit: config.unit,
			batteryLevel: Math.round(Math.random() * 60 + 40), // 40-100%
			lastSeen: new Date(Date.now() - Math.random() * 3600000).toISOString(),
		};
	});
}

export default function SensorHealthPage() {
	const [statusFilter, setStatusFilter] = useState<string>("all");
	const [siteFilter, setSiteFilter] = useState<string>("all");
	const [typeFilter, setTypeFilter] = useState<string>("all");

	// Enrich sensors with site and equipment names
	const enrichedSensors = useMemo(() => enrichSensors(), []);

	// Filter sensors
	const filteredSensors = useMemo(() => {
		return enrichedSensors.filter((sensor) => {
			if (statusFilter !== "all" && sensor.status !== statusFilter) return false;
			if (siteFilter !== "all" && sensor.siteId !== siteFilter) return false;
			if (typeFilter !== "all" && sensor.type !== typeFilter) return false;
			return true;
		});
	}, [enrichedSensors, statusFilter, siteFilter, typeFilter]);

	// Calculate stats
	const stats = useMemo(() => {
		const total = enrichedSensors.length;
		const active = enrichedSensors.filter((s) => s.status === "active").length;
		const offline = enrichedSensors.filter(
			(s) => s.status === "offline" || s.status === "stale",
		).length;
		const warning = enrichedSensors.filter((s) => s.status === "warning").length;
		const error = enrichedSensors.filter((s) => s.status === "error").length;

		return {
			total,
			active,
			offline,
			warning,
			error,
			activePercent: total > 0 ? Math.round((active / total) * 100) : 0,
		};
	}, [enrichedSensors]);

	// Get unique types for filter
	const sensorTypes = useMemo(() => {
		return [...new Set(enrichedSensors.map((s) => s.type))];
	}, [enrichedSensors]);

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-2xl font-semibold text-foreground">Sensor Health</h1>
				<p className="text-sm text-muted-foreground">
					Monitor sensor status, battery levels, and connectivity across all sites
				</p>
			</div>

			{/* Health Stats */}
			<SensorHealthStats stats={stats} />

			{/* Filters */}
			<DashboardPanel title="Filters">
				<SensorHealthFilters
					statusFilter={statusFilter}
					setStatusFilter={setStatusFilter}
					siteFilter={siteFilter}
					setSiteFilter={setSiteFilter}
					typeFilter={typeFilter}
					setTypeFilter={setTypeFilter}
					sites={sites}
					sensorTypes={sensorTypes}
				/>
			</DashboardPanel>

			{/* Sensors Table */}
			<DashboardPanel
				title="All Sensors"
				description={`Showing ${filteredSensors.length} of ${enrichedSensors.length} sensors`}
			>
				<SensorHealthTable sensors={filteredSensors} />
			</DashboardPanel>
		</div>
	);
}
