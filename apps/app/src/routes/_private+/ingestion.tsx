import { useState } from "react";

import {
	getAllIngestionRuns,
	getIngestionRunsLast24h,
	ingestionRuns,
	siteSensors,
	validateSensorReading,
} from "~@/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";
import {
	ApiIngestionTab,
	CsvUploadTab,
	DashboardPanel,
	DashboardShell,
	IngestionHistory,
	type IngestionRun,
} from "~@/views";

export default function DataIngestionPage() {
	const [activeTab, setActiveTab] = useState("api");
	const [, setRefreshKey] = useState(0);

	// Get valid sensor IDs from mock data
	const validSensorIds = siteSensors.map((s) => s.id);

	// Get ingestion runs filtered by source
	const allRuns = getAllIngestionRuns();
	const apiRuns24h = getIngestionRunsLast24h().filter((r) => r.source === "api");

	// Handle new ingestion run from CSV upload
	const handleIngestionComplete = (run: IngestionRun) => {
		// Add to mock data array (in real app would be persisted to backend)
		ingestionRuns.unshift(run);
		// Force refresh
		setRefreshKey((k) => k + 1);
	};

	return (
		<DashboardShell>
			<div className="space-y-6">
				{/* Page Header */}
				<div>
					<h1 className="text-xl font-semibold text-foreground">Data Ingestion</h1>
					<p className="text-sm text-muted-foreground">
						Receive sensor readings from multiple sources. Support API automatic data and CSV file
						uploads.
					</p>
				</div>

				{/* Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="api">API Ingestion</TabsTrigger>
						<TabsTrigger value="csv">CSV Upload</TabsTrigger>
					</TabsList>

					<TabsContent value="api" className="space-y-6">
						<ApiIngestionTab
							apiRuns24h={apiRuns24h}
							validSensorIds={validSensorIds}
							onValidateReading={validateSensorReading}
						/>
					</TabsContent>

					<TabsContent value="csv" className="space-y-6">
						<CsvUploadTab
							validSensorIds={validSensorIds}
							onValidateReading={validateSensorReading}
							onIngestionComplete={handleIngestionComplete}
						/>
					</TabsContent>
				</Tabs>

				{/* Ingestion History (shared section) */}
				<DashboardPanel
					title="Ingestion History"
					description="View all ingestion runs from API and CSV sources"
				>
					<IngestionHistory runs={allRuns} />
				</DashboardPanel>
			</div>
		</DashboardShell>
	);
}
