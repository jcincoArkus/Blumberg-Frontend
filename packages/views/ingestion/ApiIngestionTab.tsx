import { AlertCircle, CheckCircle2, Copy, Database, Loader2, Send, XCircle } from "lucide-react";
import { useState } from "react";

import { ingestReadingsV1 } from "~@/api";
import type { DataTablePaginationInfo } from "~@/data-table";
import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	cn,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	Textarea,
} from "~@/ui";

import type { IngestionRun } from "./types";

const UNIT_MAP: Record<string, number> = {
	"°c": 0,
	celsius: 0,
	"°f": 1,
	fahrenheit: 1,
	"%": 2,
	percent: 2,
	ppm: 3,
	psi: 4,
	bar: 5,
	kw: 6,
	kwh: 7,
	custom: 8,
};

function parseUnit(u: unknown): number {
	if (typeof u === "number" && u >= 0 && u <= 8) return u;
	const s = String(u ?? "")
		.toLowerCase()
		.trim();
	return UNIT_MAP[s] ?? 0;
}

const examplePayload = {
	readings: [
		{
			sensorId: "00000000-0000-0000-0000-000000000001",
			timestampUtc: "2024-01-15T10:30:00Z",
			value: -18.2,
			unit: 0,
		},
		{
			sensorId: "00000000-0000-0000-0000-000000000002",
			timestampUtc: "2024-01-15T10:30:00Z",
			value: 45,
			unit: 2,
		},
	],
};

type ReadingBodyItem = {
	sensorId: string;
	value: number;
	timestampUtc: string;
	unit: number;
};

interface ApiIngestionTabProps {
	apiRuns24h: IngestionRun[];
	validSensorIds: string[];
	runsLoading?: boolean;
	runsError?: string | null;
	onValidateReading: (
		reading: { sensorId?: string; timestamp?: string; value?: number },
		validIds: string[],
	) => { valid: boolean; errors: string[] };
	/** When provided, use ViewModel mutation (ObservedMutation) instead of direct API call */
	onSubmitReadings?: (
		body: ReadingBodyItem[],
	) => Promise<{ acceptedRecords?: number; rejectedRecords?: number } | undefined>;
	isSubmittingReadings?: boolean;
	onSendTest?: () => void;
	/** Pagination for Recent Ingestion Log (when provided, shows pagination controls) */
	recent24hPagination?: DataTablePaginationInfo;
	onRecent24hPageChange?: (pageIndex: number) => void;
	/** When provided, KPI cards use these totals (all 24h) instead of summing the current page */
	last24hStats?: {
		totalRecords: number;
		acceptedRecords: number;
		rejectedRecords: number;
		uniqueErrorTypes: number;
	} | null;
}

export function ApiIngestionTab({
	apiRuns24h,
	validSensorIds: _validSensorIds,
	runsLoading = false,
	runsError = null,
	onValidateReading: _onValidateReading,
	onSubmitReadings,
	isSubmittingReadings = false,
	onSendTest,
	recent24hPagination,
	onRecent24hPageChange,
	last24hStats,
}: ApiIngestionTabProps) {
	const [testPayload, setTestPayload] = useState(JSON.stringify(examplePayload, null, 2));
	const [testResult, setTestResult] = useState<{
		accepted: number;
		rejected: number;
		errors: Array<{ code: string; message: string; count: number }>;
	} | null>(null);
	const [localTesting, setLocalTesting] = useState(false);
	const isTesting = isSubmittingReadings || localTesting;

	// KPIs: use backend 24h stats when available (all runs in range), else sum current page
	// errors = unique error types (from backend when available), else distinct count from current page
	const kpis = last24hStats
		? {
				totalRecords: last24hStats.totalRecords,
				accepted: last24hStats.acceptedRecords,
				rejected: last24hStats.rejectedRecords,
				errors: last24hStats.uniqueErrorTypes,
			}
		: (() => {
				const errorCodes = new Set(apiRuns24h.flatMap((r) => r.errors.map((e) => e.code)));
				return {
					totalRecords: apiRuns24h.reduce((sum, r) => sum + r.totalRecords, 0),
					accepted: apiRuns24h.reduce((sum, r) => sum + r.acceptedCount, 0),
					rejected: apiRuns24h.reduce((sum, r) => sum + r.rejectedCount, 0),
					errors: errorCodes.size,
				};
			})();

	const handleTestPayload = async () => {
		setTestResult(null);
		setLocalTesting(true);

		try {
			const payload = JSON.parse(testPayload);
			const rawReadings = payload.readings ?? payload;
			const readingsArray = Array.isArray(rawReadings) ? rawReadings : [rawReadings];

			if (readingsArray.length === 0) {
				throw new Error(t`Payload must contain at least one reading`);
			}

			const body: ReadingBodyItem[] = readingsArray.map((r: Record<string, unknown>) => {
				const ts = (r.timestampUtc ?? r.timestamp) as string | undefined;
				const tsDate = ts ? new Date(ts) : new Date();
				if (isNaN(tsDate.getTime())) {
					throw new Error(t`Invalid timestamp: ${String(ts)}`);
				}
				return {
					sensorId: String(r.sensorId ?? ""),
					value: Number(r.value),
					timestampUtc: tsDate.toISOString(),
					unit: parseUnit(r.unit),
				};
			});

			if (onSubmitReadings) {
				const data = await onSubmitReadings(body);
				const accepted = data?.acceptedRecords ?? 0;
				const rejected = data?.rejectedRecords ?? 0;
				setTestResult({
					accepted,
					rejected,
					errors:
						rejected > 0
							? [{ code: "REJECTED", message: t`Rejected by server`, count: rejected }]
							: [],
				});
				onSendTest?.();
				return;
			}

			const res = await ingestReadingsV1({ body: body as never, throwOnError: false });

			if (res.error) {
				const err = res.error as { response?: { data?: { message?: string } } };
				const message =
					err?.response?.data?.message ??
					(res.error as unknown as Error)?.message ??
					t`Request failed`;
				setTestResult({
					accepted: 0,
					rejected: body.length,
					errors: [{ code: "API_ERROR", message, count: 1 }],
				});
				return;
			}

			const data = res.data as { acceptedRecords?: number; rejectedRecords?: number } | undefined;
			const accepted = data?.acceptedRecords ?? 0;
			const rejected = data?.rejectedRecords ?? 0;
			setTestResult({
				accepted,
				rejected,
				errors:
					rejected > 0
						? [{ code: "REJECTED", message: t`Rejected by server`, count: rejected }]
						: [],
			});
			onSendTest?.();
		} catch (error: unknown) {
			const message = error instanceof Error ? error.message : t`Invalid JSON payload`;
			setTestResult({
				accepted: 0,
				rejected: 0,
				errors: [{ code: "PARSE_ERROR", message, count: 1 }],
			});
		} finally {
			setLocalTesting(false);
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
					<CardTitle>{t`API Endpoint Summary`}</CardTitle>
					<CardDescription>{t`Documentation for the sensor data ingestion API`}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">{t`Endpoint URL`}</p>
						<code className="text-sm bg-muted px-2 py-1 rounded">
							{t`POST /api/v1/ingestion/readings`}
						</code>
					</div>
					<div>
						<p className="text-sm font-medium text-muted-foreground mb-1">{t`Expected Payload`}</p>
						<pre className="text-xs bg-muted p-3 rounded overflow-x-auto">
							{JSON.stringify(examplePayload, null, 2)}
						</pre>
					</div>
				</CardContent>
			</Card>

			{/* Test Payload Panel */}
			<Card>
				<CardHeader>
					<CardTitle>{t`Test Payload`}</CardTitle>
					<CardDescription>{t`Test the API endpoint with a sample payload`}</CardDescription>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="flex items-center justify-between">
						<p className="text-sm font-medium">{t`Payload JSON`}</p>
						<Button variant="outline" size="sm" onClick={handleCopyExample}>
							<Copy className="size-4 mr-1.5" aria-hidden="true" />
							{t`Copy Example`}
						</Button>
					</div>
					<Textarea
						value={testPayload}
						onChange={(e) => setTestPayload(e.target.value)}
						className="font-mono text-sm min-h-[200px]"
						placeholder={t`Enter JSON payload...`}
						aria-label={t`JSON payload input`}
					/>
					<Button onClick={handleTestPayload} disabled={isTesting}>
						{isTesting ? (
							<Loader2 className="size-4 mr-2 animate-spin" aria-hidden="true" />
						) : (
							<Send className="size-4 mr-2" aria-hidden="true" />
						)}
						{isTesting ? t`Sending...` : t`Send Test`}
					</Button>

					{testResult && (
						<div className="p-4 rounded-lg border bg-card space-y-3">
							<h4 className="text-sm font-semibold">{t`Test Results`}</h4>
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Accepted`}</p>
									<p className="text-lg font-semibold text-emerald-600">{testResult.accepted}</p>
								</div>
								<div>
									<p className="text-xs text-muted-foreground mb-1">{t`Rejected`}</p>
									<p className="text-lg font-semibold text-red-600">{testResult.rejected}</p>
								</div>
							</div>
							{testResult.errors.length > 0 && (
								<div>
									<p className="text-xs text-muted-foreground mb-2">{t`Errors`}</p>
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
						<CardTitle className="text-sm font-medium">{t`Total Records`}</CardTitle>
						<Database className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{kpis.totalRecords}</div>
						<p className="text-xs text-muted-foreground mt-1">{t`Last 24h`}</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t`Accepted`}</CardTitle>
						<CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-emerald-600">{kpis.accepted}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{t`${kpis.totalRecords > 0 ? Math.round((kpis.accepted / kpis.totalRecords) * 100) : 0}% success rate`}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t`Rejected`}</CardTitle>
						<XCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{kpis.rejected}</div>
						<p className="text-xs text-muted-foreground mt-1">
							{t`${kpis.totalRecords > 0 ? Math.round((kpis.rejected / kpis.totalRecords) * 100) : 0}% rejection rate`}
						</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">{t`Error Types`}</CardTitle>
						<AlertCircle className="h-4 w-4 text-orange-600" aria-hidden="true" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">{kpis.errors}</div>
						<p className="text-xs text-muted-foreground mt-1">{t`Unique error types`}</p>
					</CardContent>
				</Card>
			</div>

			{/* Recent Ingestion Log */}
			<Card>
				<CardHeader>
					<CardTitle>{t`Recent Ingestion Log (Last 24h)`}</CardTitle>
					<CardDescription>{t`API ingestion runs from the last 24 hours`}</CardDescription>
				</CardHeader>
				<CardContent>
					{runsError && (
						<div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
							{runsError}
						</div>
					)}
					{runsLoading ? (
						<div className="py-8 flex items-center justify-center gap-2 text-muted-foreground">
							<Loader2 className="size-6 animate-spin" aria-hidden="true" />
							<p className="text-sm">{t`Loading runs...`}</p>
						</div>
					) : apiRuns24h.length === 0 ? (
						<div className="py-8 text-center">
							<Database className="size-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
							<p className="text-sm text-muted-foreground">
								{t`No API ingestion runs in the last 24 hours`}
							</p>
						</div>
					) : (
						<>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>{t`Timestamp`}</TableHead>
										<TableHead>{t`Source`}</TableHead>
										<TableHead>{t`Total Records`}</TableHead>
										<TableHead>{t`Accepted`}</TableHead>
										<TableHead>{t`Rejected`}</TableHead>
										<TableHead>{t`Status`}</TableHead>
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
											<TableCell className="text-red-600 font-medium">
												{run.rejectedCount}
											</TableCell>
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
							{recent24hPagination &&
								onRecent24hPageChange &&
								recent24hPagination.totalPages > 1 && (
									<Pagination
										pagination={recent24hPagination}
										onPageChange={onRecent24hPageChange}
										onPageSizeChange={() => {}}
										showPageSizeSelector={false}
										showInfo={true}
									/>
								)}
						</>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
