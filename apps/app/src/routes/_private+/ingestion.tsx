import { observer } from "~@/mobx";
import { validateSensorReading } from "~@/mock-data";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";
import { useIngestionViewModel } from "~@/view-model";
import {
	ApiIngestionTab,
	CsvUploadTab,
	DashboardPanel,
	IngestionHistory,
	type IngestionRun,
} from "~@/views";

const DataIngestionPage = observer(function DataIngestionPage() {
	const vm = useIngestionViewModel();

	const handleIngestionComplete = (run: IngestionRun) => {
		vm.handleIngestionComplete(run);
	};

	return (
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
			<Tabs value={vm.activeTab} onValueChange={vm.setActiveTab} className="space-y-6">
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="api">API Ingestion</TabsTrigger>
					<TabsTrigger value="csv">CSV Upload</TabsTrigger>
				</TabsList>

				<TabsContent value="api" className="space-y-6">
					<ApiIngestionTab
						apiRuns24h={vm.apiRuns24h}
						validSensorIds={vm.validSensorIds}
						onValidateReading={validateSensorReading}
					/>
				</TabsContent>

				<TabsContent value="csv" className="space-y-6">
					<CsvUploadTab
						validSensorIds={vm.validSensorIds}
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
				<IngestionHistory runs={vm.allRuns} />
			</DashboardPanel>
		</div>
	);
});

export default DataIngestionPage;
