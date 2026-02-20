import { useEffect } from "react";

import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { validateSensorReading } from "~@/mock-data";
import { DashboardPanel, Tabs, TabsContent, TabsList, TabsTrigger } from "~@/ui";
import { useIngestionViewModel } from "~@/view-model";
import { ApiIngestionTab, CsvUploadTab, IngestionHistory, type IngestionRun } from "~@/views";

const DataIngestionPage = observer(function DataIngestionPage() {
	const vm = useIngestionViewModel();

	useEffect(() => {
		vm.loadAll();
	}, [vm]);

	const handleIngestionComplete = (run: IngestionRun) => {
		vm.handleIngestionComplete(run);
	};

	return (
		<div className="space-y-6">
			{/* Page Header */}
			<div>
				<h1 className="text-xl font-semibold text-foreground">{t`Data Ingestion`}</h1>
				<p className="text-sm text-muted-foreground">
					{t`Receive sensor readings from multiple sources. Support API automatic data and CSV file uploads.`}
				</p>
			</div>

			{/* Tabs */}
			<Tabs
				value={vm.activeTab}
				onValueChange={vm.setActiveTab as (value: string) => void}
				className="space-y-6"
			>
				<TabsList className="grid w-full grid-cols-2">
					<TabsTrigger value="api">{t`API Ingestion`}</TabsTrigger>
					<TabsTrigger value="csv">{t`CSV Upload`}</TabsTrigger>
				</TabsList>

				<TabsContent value="api" className="space-y-6">
					<ApiIngestionTab
						apiRuns24h={vm.apiRuns24h}
						validSensorIds={vm.validSensorIds}
						runsLoading={vm.loadingRuns}
						runsError={vm.runsError}
						onValidateReading={validateSensorReading}
						onSubmitReadings={vm.submitReadings}
						isSubmittingReadings={vm.isSubmittingReadings}
						onSendTest={vm.refreshAfterIngestion}
						recent24hPagination={vm.recent24hPagination}
						onRecent24hPageChange={vm.setRecent24hPageByIndex}
						last24hStats={vm.last24hStats}
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
				title={t`Ingestion History`}
				description={t`View all ingestion runs from API and CSV sources`}
			>
				<IngestionHistory
					runs={vm.allRuns}
					loading={vm.loadingRuns}
					error={vm.runsError}
					onViewDetails={vm.fetchRunDetail}
					loadingDetail={vm.loadingDetail}
					pagination={vm.historyPagination}
					onPageChange={vm.setHistoryPageByIndex}
				/>
			</DashboardPanel>
		</div>
	);
});

export default DataIngestionPage;
