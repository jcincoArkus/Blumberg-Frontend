import { CheckCircle2, FileText, X, XCircle } from "lucide-react";

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
	Drawer,
	DrawerClose,
	DrawerContent,
	DrawerDescription,
	DrawerHeader,
	DrawerTitle,
	Separator,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import type { IngestionRun } from "./types";

interface IngestionRunDetailsDrawerProps {
	run: IngestionRun;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export function IngestionRunDetailsDrawer({
	run,
	open,
	onOpenChange,
}: IngestionRunDetailsDrawerProps) {
	const formatTimestamp = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	return (
		<Drawer open={open} onOpenChange={onOpenChange} direction="right">
			<DrawerContent className="h-full w-full sm:max-w-2xl">
				<DrawerHeader className="border-b">
					<div className="flex items-start justify-between">
						<div className="flex-1">
							<DrawerTitle className="text-xl font-semibold mb-2">
								{t`Ingestion Run Details`}
							</DrawerTitle>
							<DrawerDescription>
								{run.id} • {run.source.toUpperCase()}
							</DrawerDescription>
						</div>
						<DrawerClose asChild>
							<Button
								variant="ghost"
								size="sm"
								className="h-8 w-8 p-0"
								aria-label={t`Close drawer`}
							>
								<X className="h-4 w-4" aria-hidden="true" />
							</Button>
						</DrawerClose>
					</div>
				</DrawerHeader>

				<div className="flex-1 overflow-y-auto p-6 space-y-6">
					{/* Summary */}
					<div className="grid grid-cols-2 gap-4">
						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">{t`Accepted`}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2">
									<CheckCircle2 className="size-5 text-emerald-600" aria-hidden="true" />
									<p className="text-2xl font-bold text-emerald-600">{run.acceptedCount}</p>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">{t`Rejected`}</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="flex items-center gap-2">
									<XCircle className="size-5 text-red-600" aria-hidden="true" />
									<p className="text-2xl font-bold text-red-600">{run.rejectedCount}</p>
								</div>
							</CardContent>
						</Card>
					</div>

					<Separator />

					{/* Run Info */}
					<div className="space-y-3">
						<div>
							<p className="text-xs text-muted-foreground mb-1">{t`Run ID`}</p>
							<p className="text-sm font-mono font-medium">{run.id}</p>
						</div>
						<div>
							<p className="text-xs text-muted-foreground mb-1">{t`Source`}</p>
							<Badge variant="outline" className="capitalize">
								{run.source}
							</Badge>
						</div>
						<div>
							<p className="text-xs text-muted-foreground mb-1">{t`Created At`}</p>
							<p className="text-sm">{formatTimestamp(run.createdAt)}</p>
						</div>
						{run.requestId && (
							<div>
								<p className="text-xs text-muted-foreground mb-1">{t`Request ID`}</p>
								<p className="text-sm font-mono">{run.requestId}</p>
							</div>
						)}
						{run.fileName && (
							<div>
								<p className="text-xs text-muted-foreground mb-1">{t`File Name`}</p>
								<div className="flex items-center gap-2">
									<FileText className="size-4 text-muted-foreground" aria-hidden="true" />
									<p className="text-sm">{run.fileName}</p>
								</div>
							</div>
						)}
						<div>
							<p className="text-xs text-muted-foreground mb-1">{t`Status`}</p>
							<Badge
								variant="outline"
								className={cn(
									run.status === "success" && "bg-emerald-100 text-emerald-700 border-emerald-200",
									run.status === "partial" && "bg-amber-100 text-amber-700 border-amber-200",
									run.status === "fail" && "bg-red-100 text-red-700 border-red-200",
								)}
							>
								{run.status}
							</Badge>
						</div>
					</div>

					{/* Error Breakdown */}
					{run.errors.length > 0 && (
						<>
							<Separator />
							<div className="space-y-4">
								<h3 className="text-sm font-semibold text-foreground">{t`Error Breakdown`}</h3>
								<Card>
									<CardContent className="p-4">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>{t`Error Code`}</TableHead>
													<TableHead>{t`Message`}</TableHead>
													<TableHead className="text-right">{t`Count`}</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{run.errors.map((error, idx) => (
													<TableRow key={idx}>
														<TableCell className="font-mono text-xs">{error.code}</TableCell>
														<TableCell className="text-sm">{error.message}</TableCell>
														<TableCell className="text-right">
															<Badge variant="outline">{error.count}</Badge>
														</TableCell>
													</TableRow>
												))}
											</TableBody>
										</Table>
									</CardContent>
								</Card>
							</div>
						</>
					)}

					{/* Rejected Rows Sample */}
					{run.rejectedRowsSample && run.rejectedRowsSample.length > 0 && (
						<>
							<Separator />
							<div className="space-y-4">
								<h3 className="text-sm font-semibold text-foreground">{t`Rejected Rows Sample`}</h3>
								<Card>
									<CardHeader className="pb-3">
										<CardTitle className="text-sm">{t`Sample of Rejected Rows`}</CardTitle>
										<CardDescription>
											{t`Showing first ${run.rejectedRowsSample.length} rejected rows`}
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="overflow-x-auto">
											<Table>
												<TableHeader>
													<TableRow>
														<TableHead>{t`Row #`}</TableHead>
														<TableHead>{t`Reason`}</TableHead>
														<TableHead>{t`Data`}</TableHead>
													</TableRow>
												</TableHeader>
												<TableBody>
													{run.rejectedRowsSample.map((row, idx) => (
														<TableRow key={idx}>
															<TableCell className="font-mono text-xs">{row.rowNumber}</TableCell>
															<TableCell>
																<div>
																	<p className="text-xs font-medium">{row.reasonCode}</p>
																	<p className="text-xs text-muted-foreground">
																		{row.reasonMessage}
																	</p>
																</div>
															</TableCell>
															<TableCell>
																<pre className="text-xs bg-muted p-2 rounded overflow-x-auto max-w-xs">
																	{JSON.stringify(row.raw, null, 2)}
																</pre>
															</TableCell>
														</TableRow>
													))}
												</TableBody>
											</Table>
										</div>
									</CardContent>
								</Card>
							</div>
						</>
					)}
				</div>
			</DrawerContent>
		</Drawer>
	);
}
