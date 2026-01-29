import { AlertCircle, CheckCircle2, Copy, Database, Send, XCircle } from "lucide-react";
import { useState } from "react";

import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	cn,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Textarea,
} from "~@/ui";

import type { IngestionRun } from "./types";

const examplePayload = {
	readings: [
		{
			sensorId: "s-1",
			timestamp: "2024-01-15T10:30:00Z",
			value: -18.2,
			unit: "°C",
		},
		{
			sensorId: "s-2",
			timestamp: "2024-01-15T10:30:00Z",
			value: 45,
			unit: "%",
		},
	],
};

interface ApiIngestionTabProps {
	apiRuns24h: IngestionRun[];
	validSensorIds: string[];
	onValidateReading: (
		reading: { sensorId?: string; timestamp?: string; value?: number },
		validIds: string[],
	) => { valid: boolean; errors: string[] };
}

export function ApiIngestionTab({
	apiRuns24h,
	validSensorIds,
	onValidateReading,
}: ApiIngestionTabProps) {
	const [testPayload, setTestPayload] = useState(JSON.stringify(examplePayload, null, 2));
	const [testResult, setTestResult] = useState<{
		accepted: number;
		rejected: number;
		errors: Array<{ code: string; message: string; count: number }>;
	} | null>(null);
	const [isTesting, setIsTesting] = useState(false);

	// Calculate KPIs
	const kpis = {
		totalRecords: apiRuns24h.reduce((sum, r) => sum + r.totalRecords, 0),
		accepted: apiRuns24h.reduce((sum, r) => sum + r.acceptedCount, 0),
		rejected: apiRuns24h.reduce((sum, r) => sum + r.rejectedCount, 0),
		errors: apiRuns24h.reduce((sum, r) => sum + r.errors.length, 0),
	};

	const handleTestPayload = async () => {
		setIsTesting(true);
		setTestResult(null);

		try {
			const payload = JSON.parse(testPayload);

			if (!payload.readings || !Array.isArray(payload.readings)) {
				throw new Error('Payload must contain a "readings" array');
			}

			let accepted = 0;
			let rejected = 0;
			const errorCounts: Record<string, number> = {};

			payload.readings.forEach((reading: Record<string, unknown>) => {
				const validation = onValidateReading(
					{
						sensorId: reading.sensorId as string,
						timestamp: reading.timestamp as string,
						value: reading.value as number,
					},
					validSensorIds,
				);
				if (validation.valid) {
					accepted++;
				} else {
					rejected++;
					validation.errors.forEach((error) => {
						const code = error.toUpperCase().replace(/\s+/g, "_");
						errorCounts[code] = (errorCounts[code] || 0) + 1;
					});
				}
			});

			const errors = Object.entries(errorCounts).map(([code, count]) => ({
				code,
				message: code.replace(/_/g, " ").toLowerCase(),
				count,
			}));

			setTestResult({ accepted, rejected, errors });
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : "Invalid JSON payload";
			setTestResult({
				accepted: 0,
				rejected: 0,
				errors: [{ code: "PARSE_ERROR", message, count: 1 }],
			});
		} finally {
			setIsTesting(false);
		}
	};

	const handleCopyExample = () => {
		navigator.clipboard.writeText(JSON.stringify(examplePayload, null, 2));
	};

	const formatTimestamp = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className="space-y-6">
			{/* API Endpoint Summary */}
			<Card>
				<CardHeader>
					<CardTitle>API Endpoint Summary</CardTitle>
					<CardDescription>Documentation for the sensor data ingestion API</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">Endpoint URL</p>
						<code className="text-sm bg-muted px-2 py-1 rounded">POST /api/ingestion/readings</code>
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">Expected Payload</p>
						<pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
							{JSON.stringify(examplePayload, null, 2)}
						</pre>
					</div>
				</CardContent>
			</Card>

			{/* Test Payload Panel */}
			<Card>
				<CardHeader>
					<CardTitle>Test Payload</CardTitle>
					<CardDescription>Test the API endpoint with a sample payload</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">Payload JSON</p>
						<Button variant="outline" size="sm" onClick={handleCopyExample}>
							<Copy className="size-4 mr-1.5" aria-hidden="true" />
							Copy Example
						</Button>
					</div>
					<Textarea
						value={testPayload}
						onChange={(e) => setTestPayload(e.target.value)}
						className="font-mono text-sm min-h-[200px]"
						placeholder="Enter JSON payload..."
						aria-label="JSON payload input"
					/>
					<Button onClick={handleTestPayload} disabled={isTesting}>
						<Send className="size-4 mr-2" aria-hidden="true" />
						{isTesting ? "Sending..." : "Send Test"}
					</Button>

					{testResult && (
						<div className="p-4 rounded-lg border bg-card space-y-3">
							<h4 className="text-sm font-semibold">Test Results</h4>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-muted-foreground mb-1">Accepted</p>
									<p className="text-lg font-semibold text-emerald-600">{testResult.accepted}</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">Rejected</p>
									<p className="text-lg font-semibold text-red-600">{testResult.rejected}</p>
								</div>
							</div>
							{testResult.errors.length > 0 && (
								<div>
									<p className="text-xs text-muted-foreground mb-2">Errors</p>
									<div className="space-y-1">
										{testResult.errors.map((error, idx) => (
											<div key={idx} className="flex items-center justify-between text-xs">
												<span className="text-muted-foreground">{error.message}</span>
												<Badge variant="outline">{error.count}</Badge>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					)}
				</CardContent>
			</Card>

			{/* API Ingestion Health (Last 24h) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Records</CardTitle>
						<Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{kpis.totalRecords}</div>
						<p className="text-xs text-muted-foreground mt-1">Last 24h</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Accepted</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-emerald-600">{kpis.accepted}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{kpis.totalRecords > 0 ? Math.round((kpis.accepted / kpis.totalRecords) * 100) : 0}%
							success rate
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Rejected</CardTitle>
						<XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{kpis.rejected}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{kpis.totalRecords > 0 ? Math.round((kpis.rejected / kpis.totalRecords) * 100) : 0}%
							rejection rate
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Error Types</CardTitle>
						<AlertCircle className="h-4 w-4 text-orange-600" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">{kpis.errors}</div>
						<p className="text-xs text-muted-foreground mt-1">Unique error types</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Ingestion Log */}
			<Card>
				<CardHeader>
					<CardTitle>Recent Ingestion Log (Last 24h)</CardTitle>
					<CardDescription>API ingestion runs from the last 24 hours</CardDescription>
				</CardHeader>
				<CardContent>
					{apiRuns24h.length === 0 ? (
						<div className="py-8 text-center">
							<Database className="size-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
							<p className="text-sm text-muted-foreground">
								No API ingestion runs in the last 24 hours
							</p>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Timestamp</TableHead>
									<TableHead>Source</TableHead>
									<TableHead>Total Records</TableHead>
									<TableHead>Accepted</TableHead>
									<TableHead>Rejected</TableHead>
									<TableHead>Status</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{apiRuns24h.map((run) => (
									<TableRow key={run.id}>
										<TableCell className="text-sm">{formatTimestamp(run.createdAt)}</TableCell>
										<TableCell>
											<Badge variant="outline" className="capitalize">
												{run.source}
											</Badge>
										</TableCell>
										<TableCell>{run.totalRecords}</TableCell>
										<TableCell className="text-emerald-600 font-medium">
											{run.acceptedCount}
										</TableCell>
										<TableCell className="text-red-600 font-medium">{run.rejectedCount}</TableCell>
										<TableCell>
											<Badge
												variant="outline"
												className={cn(
													run.status === "success" &&
														"bg-emerald-100 text-emerald-700 border-emerald-200",
													run.status === "partial" &&
														"bg-amber-100 text-amber-700 border-amber-200",
													run.status === "fail" && "bg-red-100 text-red-700 border-red-200",
												)}
											>
												{run.status}
											</Badge>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
