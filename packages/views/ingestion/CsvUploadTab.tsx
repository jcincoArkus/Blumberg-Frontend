import { ArrowRight, CheckCircle2, Download, FileDown, Upload, XCircle } from "lucide-react";
import { useRef, useState } from "react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import type { IngestionRun, RejectedRow, SensorReading } from "./types";

type UploadStep = "upload" | "preview" | "validate" | "confirm" | "results";

interface ParsedRow {
	rowNumber: number;
	data: Record<string, string>;
}

interface ValidatedRow {
	rowNumber: number;
	data: SensorReading;
	valid: boolean;
	errors: string[];
}

const csvTemplate = `sensor_id,timestamp,value,unit,reading_type
s-1,2024-01-15T10:00:00Z,-18.2,°C,temperature
s-2,2024-01-15T10:00:00Z,45,%,humidity
s-3,2024-01-15T10:00:00Z,12.5,kW,energy`;

interface CsvUploadTabProps {
	validSensorIds: string[];
	onValidateReading: (
		reading: Partial<SensorReading>,
		validIds: string[],
	) => { valid: boolean; errors: string[] };
	onIngestionComplete?: (run: IngestionRun) => void;
}

export function CsvUploadTab({
	validSensorIds,
	onValidateReading,
	onIngestionComplete,
}: CsvUploadTabProps) {
	const [step, setStep] = useState<UploadStep>("upload");
	const [file, setFile] = useState<File | null>(null);
	const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
	const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
	const [validatedRows, setValidatedRows] = useState<ValidatedRow[]>([]);
	const [rejectedRows, setRejectedRows] = useState<RejectedRow[]>([]);
	const [ingestionRun, setIngestionRun] = useState<IngestionRun | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleDownloadTemplate = () => {
		const blob = new Blob([csvTemplate], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "sensor_readings_template.csv";
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedFile = event.target.files?.[0];
		if (selectedFile) {
			setFile(selectedFile);
			parseCsv(selectedFile);
		}
	};

	const handleDrop = (event: React.DragEvent) => {
		event.preventDefault();
		const droppedFile = event.dataTransfer.files[0];
		if (droppedFile?.type === "text/csv" || droppedFile?.name.endsWith(".csv")) {
			setFile(droppedFile);
			parseCsv(droppedFile);
		}
	};

	const parseCsv = async (csvFile: File) => {
		const text = await csvFile.text();
		const lines = text.split("\n").filter((line) => line.trim());
		if (lines.length === 0) return;

		const headers = lines[0].split(",").map((h) => h.trim());
		const rows: ParsedRow[] = [];

		for (let i = 1; i < lines.length; i++) {
			const values = lines[i].split(",").map((v) => v.trim());
			const rowData: Record<string, string> = {};
			headers.forEach((header, idx) => {
				rowData[header] = values[idx] || "";
			});
			rows.push({ rowNumber: i + 1, data: rowData });
		}

		// Auto-map columns
		const mapping: Record<string, string> = {};
		headers.forEach((header) => {
			const lowerHeader = header.toLowerCase();
			if (lowerHeader.includes("sensor") && lowerHeader.includes("id")) {
				mapping[header] = "sensorId";
			} else if (lowerHeader.includes("timestamp") || lowerHeader.includes("time")) {
				mapping[header] = "timestamp";
			} else if (lowerHeader.includes("value") || lowerHeader.includes("reading")) {
				mapping[header] = "value";
			} else if (lowerHeader.includes("unit")) {
				mapping[header] = "unit";
			} else if (lowerHeader.includes("type")) {
				mapping[header] = "readingType";
			}
		});

		setParsedRows(rows);
		setColumnMapping(mapping);
		setStep("preview");
	};

	const handleValidate = () => {
		const validated: ValidatedRow[] = [];
		const rejected: RejectedRow[] = [];

		parsedRows.forEach((row) => {
			const reading: Partial<SensorReading> = {
				sensorId:
					row.data[Object.keys(columnMapping).find((k) => columnMapping[k] === "sensorId") || ""] ||
					"",
				timestamp:
					row.data[
						Object.keys(columnMapping).find((k) => columnMapping[k] === "timestamp") || ""
					] || "",
				value: parseFloat(
					row.data[Object.keys(columnMapping).find((k) => columnMapping[k] === "value") || ""] ||
						"",
				),
				unit: row.data[Object.keys(columnMapping).find((k) => columnMapping[k] === "unit") || ""],
				readingType:
					row.data[
						Object.keys(columnMapping).find((k) => columnMapping[k] === "readingType") || ""
					],
			};

			const validation = onValidateReading(reading, validSensorIds);

			if (validation.valid) {
				validated.push({
					rowNumber: row.rowNumber,
					data: reading as SensorReading,
					valid: true,
					errors: [],
				});
			} else {
				validated.push({
					rowNumber: row.rowNumber,
					data: reading as SensorReading,
					valid: false,
					errors: validation.errors,
				});
				rejected.push({
					rowNumber: row.rowNumber,
					raw: row.data,
					reasonCode: validation.errors[0].toUpperCase().replace(/\s+/g, "_"),
					reasonMessage: validation.errors.join("; "),
				});
			}
		});

		setValidatedRows(validated);
		setRejectedRows(rejected);
		setStep("validate");
	};

	const handleConfirmImport = () => {
		const acceptedRows = validatedRows.filter((r) => r.valid);
		if (acceptedRows.length === 0) return;

		const errorCounts: Record<string, number> = {};
		rejectedRows.forEach((row) => {
			errorCounts[row.reasonCode] = (errorCounts[row.reasonCode] || 0) + 1;
		});

		const errors = Object.entries(errorCounts).map(([code, count]) => ({
			code,
			message: code.replace(/_/g, " ").toLowerCase(),
			count,
		}));

		const run: IngestionRun = {
			id: `run-${Date.now()}`,
			source: "csv",
			createdAt: new Date().toISOString(),
			totalRecords: validatedRows.length,
			acceptedCount: acceptedRows.length,
			rejectedCount: rejectedRows.length,
			status:
				rejectedRows.length === 0
					? "success"
					: rejectedRows.length === validatedRows.length
						? "fail"
						: "partial",
			errors,
			fileName: file?.name,
			rejectedRowsSample: rejectedRows.slice(0, 10),
		};

		setIngestionRun(run);
		setStep("results");
		onIngestionComplete?.(run);
	};

	const handleDownloadRejected = () => {
		if (rejectedRows.length === 0) return;

		const headers = ["row_number", "error_reason", ...Object.keys(rejectedRows[0].raw)];
		const csvContent = [
			headers.join(","),
			...rejectedRows.map((row) =>
				[row.rowNumber, row.reasonMessage, ...Object.values(row.raw)].join(","),
			),
		].join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `rejected_rows_${Date.now()}.csv`;
		a.click();
		window.URL.revokeObjectURL(url);
	};

	const handleReset = () => {
		setStep("upload");
		setFile(null);
		setParsedRows([]);
		setColumnMapping({});
		setValidatedRows([]);
		setRejectedRows([]);
		setIngestionRun(null);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const acceptedCount = validatedRows.filter((r) => r.valid).length;
	const rejectedCount = validatedRows.filter((r) => !r.valid).length;

	return (
		<div className="space-y-6">
			{/* Step 1: Upload */}
			{step === "upload" && (
				<Card>
					<CardHeader>
						<CardTitle>{t`Upload CSV File`}</CardTitle>
						<CardDescription>
							{t`Upload a CSV file with sensor readings or download the template`}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm font-medium mb-1">{t`CSV Template`}</p>
								<p className="text-xs text-muted-foreground">
									{t`Download a template with the correct format`}
								</p>
							</div>
							<Button variant="outline" onClick={handleDownloadTemplate}>
								<Download className="size-4 mr-2" aria-hidden="true" />
								{t`Download Template`}
							</Button>
						</div>

						<div
							role="button"
							tabIndex={0}
							className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
							onDrop={handleDrop}
							onDragOver={(e) => e.preventDefault()}
							onClick={() => fileInputRef.current?.click()}
							onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
							aria-label={t`Drop CSV file here or click to browse`}
						>
							<Upload className="size-8 mx-auto mb-2 text-muted-foreground" aria-hidden="true" />
							<p className="text-sm font-medium mb-1">
								{file ? file.name : t`Drop CSV file here or click to browse`}
							</p>
							<p className="text-xs text-muted-foreground">
								{t`Supported columns: sensor_id, timestamp, value, unit, reading_type`}
							</p>
							<input
								ref={fileInputRef}
								type="file"
								accept=".csv"
								onChange={handleFileSelect}
								className="hidden"
								aria-label={t`Upload CSV file`}
							/>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 2: Preview + Column Mapping */}
			{step === "preview" && parsedRows.length > 0 && (
				<Card>
					<CardHeader>
						<CardTitle>{t`Preview & Column Mapping`}</CardTitle>
						<CardDescription>{t`Review parsed data and map columns to expected fields`}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<p className="text-sm font-medium">{t`Column Mapping`}</p>
							{Object.keys(parsedRows[0].data).map((header) => (
								<div key={header} className="flex items-center gap-2">
									<span className="text-sm text-muted-foreground w-32">{header}:</span>
									<Select
										value={columnMapping[header] || ""}
										onValueChange={(value) =>
											setColumnMapping({ ...columnMapping, [header]: value })
										}
									>
										<SelectTrigger className="w-48">
											<SelectValue placeholder={t`Select field`} />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="">{t`Not mapped`}</SelectItem>
											<SelectItem value="sensorId">{t`Sensor ID (required)`}</SelectItem>
											<SelectItem value="timestamp">{t`Timestamp (required)`}</SelectItem>
											<SelectItem value="value">{t`Value (required)`}</SelectItem>
											<SelectItem value="unit">{t`Unit (optional)`}</SelectItem>
											<SelectItem value="readingType">{t`Reading Type (optional)`}</SelectItem>
										</SelectContent>
									</Select>
								</div>
							))}
						</div>

						<div>
							<p className="text-sm font-medium mb-2">{t`Preview (first 20 rows)`}</p>
							<div className="border rounded-lg overflow-x-auto max-h-96">
								<Table>
									<TableHeader>
										<TableRow>
											<TableHead>{t`Row`}</TableHead>
											{Object.keys(parsedRows[0].data).map((header) => (
												<TableHead key={header}>{header}</TableHead>
											))}
										</TableRow>
									</TableHeader>
									<TableBody>
										{parsedRows.slice(0, 20).map((row) => (
											<TableRow key={row.rowNumber}>
												<TableCell className="font-mono text-xs">{row.rowNumber}</TableCell>
												{Object.keys(row.data).map((header) => (
													<TableCell key={header} className="text-xs">
														{row.data[header]}
													</TableCell>
												))}
											</TableRow>
										))}
									</TableBody>
								</Table>
							</div>
							{parsedRows.length > 20 && (
								<p className="text-xs text-muted-foreground mt-2">
									{t`Showing first 20 of ${parsedRows.length} rows`}
								</p>
							)}
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={handleReset}>
								{t`Cancel`}
							</Button>
							<Button onClick={handleValidate}>
								{t`Validate`}
								<ArrowRight className="size-4 ml-2" aria-hidden="true" />
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 3: Validation Results */}
			{step === "validate" && (
				<Card>
					<CardHeader>
						<CardTitle>{t`Validation Results`}</CardTitle>
						<CardDescription>{t`Review accepted and rejected rows`}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200">
								<div className="flex items-center gap-2 mb-1">
									<CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
									<p className="text-sm font-semibold text-emerald-700">{t`Accepted`}</p>
								</div>
								<p className="text-2xl font-bold text-emerald-700">{acceptedCount}</p>
							</div>
							<div className="p-4 rounded-lg border bg-red-50 border-red-200">
								<div className="flex items-center gap-2 mb-1">
									<XCircle className="size-5 text-red-600" aria-hidden="true" />
									<p className="text-sm font-semibold text-red-700">{t`Rejected`}</p>
								</div>
								<p className="text-2xl font-bold text-red-700">{rejectedCount}</p>
							</div>
						</div>

						{rejectedRows.length > 0 && (
							<div>
								<p className="text-sm font-medium mb-2">{t`Rejection Reasons Breakdown`}</p>
								<div className="space-y-1">
									{Object.entries(
										rejectedRows.reduce(
											(acc, row) => {
												acc[row.reasonCode] = (acc[row.reasonCode] || 0) + 1;
												return acc;
											},
											{} as Record<string, number>,
										),
									).map(([code, count]) => (
										<div key={code} className="flex items-center justify-between text-sm">
											<span className="text-muted-foreground">{code.replace(/_/g, " ")}</span>
											<Badge variant="outline">{count}</Badge>
										</div>
									))}
								</div>
							</div>
						)}

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setStep("preview")}>
								{t`Back`}
							</Button>
							{acceptedCount > 0 && (
								<Button onClick={() => setStep("confirm")}>
									{t`Continue to Import`}
									<ArrowRight className="size-4 ml-2" aria-hidden="true" />
								</Button>
							)}
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 4: Confirm Import */}
			{step === "confirm" && (
				<Card>
					<CardHeader>
						<CardTitle>{t`Confirm Import`}</CardTitle>
						<CardDescription>{t`Review import summary before proceeding`}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">{t`Total Rows`}</span>
								<span className="text-sm font-medium">{validatedRows.length}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">{t`Accepted Rows`}</span>
								<span className="text-sm font-medium text-emerald-600">{acceptedCount}</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-sm text-muted-foreground">{t`Rejected Rows`}</span>
								<span className="text-sm font-medium text-red-600">{rejectedCount}</span>
							</div>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setStep("validate")}>
								{t`Back`}
							</Button>
							<Button onClick={handleConfirmImport}>{t`Import Accepted Rows`}</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Step 5: Results */}
			{step === "results" && ingestionRun && (
				<Card>
					<CardHeader>
						<CardTitle>{t`Import Results`}</CardTitle>
						<CardDescription>{t`Import completed successfully`}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-2 gap-4">
							<div className="p-4 rounded-lg border bg-emerald-50 border-emerald-200">
								<p className="text-sm font-semibold text-emerald-700 mb-1">
									{t`Accepted Rows Imported`}
								</p>
								<p className="text-2xl font-bold text-emerald-700">{ingestionRun.acceptedCount}</p>
							</div>
							<div className="p-4 rounded-lg border bg-red-50 border-red-200">
								<p className="text-sm font-semibold text-red-700 mb-1">{t`Rejected Rows`}</p>
								<p className="text-2xl font-bold text-red-700">{ingestionRun.rejectedCount}</p>
							</div>
						</div>

						{rejectedRows.length > 0 && (
							<Button variant="outline" onClick={handleDownloadRejected}>
								<FileDown className="size-4 mr-2" aria-hidden="true" />
								{t`Download Rejected Rows CSV`}
							</Button>
						)}

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={handleReset}>
								{t`Upload Another File`}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
