import { Eye, Loader2 } from "lucide-react";
import { useState } from "react";

import type { DataTablePaginationInfo } from "~@/data-table";
import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	cn,
	Pagination,
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~@/ui";

import { IngestionRunDetailsDrawer } from "./IngestionRunDetailsDrawer";
import type { IngestionRun } from "./types";

interface IngestionHistoryProps {
	runs: IngestionRun[];
	loading?: boolean;
	error?: string | null;
	onViewDetails?: (id: string) => Promise<IngestionRun | null>;
	loadingDetail?: boolean;
	/** When provided, shows pagination controls below the table */
	pagination?: DataTablePaginationInfo;
	onPageChange?: (pageIndex: number) => void;
}

export function IngestionHistory({
	runs,
	loading = false,
	error = null,
	onViewDetails,
	loadingDetail = false,
	pagination,
	onPageChange,
}: IngestionHistoryProps) {
	const [selectedRun, setSelectedRun] = useState<IngestionRun | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [detailIdLoading, setDetailIdLoading] = useState<string | null>(null);

	const formatTimestamp = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			year: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleViewDetails = async (run: IngestionRun) => {
		if (onViewDetails) {
			setDetailIdLoading(run.id);
			try {
				const detail = await onViewDetails(run.id);
				if (detail) {
					setSelectedRun(detail);
					setIsDetailsOpen(true);
				}
			} finally {
				setDetailIdLoading(null);
			}
		} else {
			setSelectedRun(run);
			setIsDetailsOpen(true);
		}
	};

	if (error) {
		return (
			<div className="py-8 rounded-lg border border-destructive/50 bg-destructive/10 px-4 py-2 text-sm text-destructive">
				{error}
			</div>
		);
	}

	if (loading) {
		return (
			<div className="py-12 flex items-center justify-center gap-2 text-muted-foreground">
				<Loader2 className="size-6 animate-spin" aria-hidden="true" />
				<p className="text-sm">{t`Loading ingestion runs...`}</p>
			</div>
		);
	}

	if (runs.length === 0) {
		return (
			<div className="py-12 text-center">
				<p className="text-sm text-muted-foreground">{t`No ingestion runs found`}</p>
			</div>
		);
	}

	return (
		<>
			<Table>
				<TableHeader>
					<TableRow>
						<TableHead>{t`Run ID`}</TableHead>
						<TableHead>{t`Source`}</TableHead>
						<TableHead>{t`Timestamp`}</TableHead>
						<TableHead>{t`Total Records`}</TableHead>
						<TableHead>{t`Accepted`}</TableHead>
						<TableHead>{t`Rejected`}</TableHead>
						<TableHead>{t`Status`}</TableHead>
						<TableHead className="text-right">{t`Actions`}</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{runs.map((run) => (
						<TableRow key={run.id}>
							<TableCell className="font-mono text-xs">{run.id}</TableCell>
							<TableCell>
								<Badge variant="outline" className="capitalize">
									{run.source}
								</Badge>
							</TableCell>
							<TableCell className="text-sm">{formatTimestamp(run.createdAt)}</TableCell>
							<TableCell>{run.totalRecords}</TableCell>
							<TableCell className="text-emerald-600 font-medium">{run.acceptedCount}</TableCell>
							<TableCell className="text-red-600 font-medium">{run.rejectedCount}</TableCell>
							<TableCell>
								<Badge
									variant="outline"
									className={cn(
										run.status === "success" &&
											"bg-emerald-100 text-emerald-700 border-emerald-200",
										run.status === "partial" && "bg-amber-100 text-amber-700 border-amber-200",
										run.status === "fail" && "bg-red-100 text-red-700 border-red-200",
									)}
								>
									{run.status}
								</Badge>
							</TableCell>
							<TableCell className="text-right">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => void handleViewDetails(run)}
									disabled={detailIdLoading != null || loadingDetail}
									className="h-8"
									aria-label={t`View details for run ${run.id}`}
								>
									{detailIdLoading === run.id ? (
										<Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
									) : (
										<Eye className="h-4 w-4" aria-hidden="true" />
									)}
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

			{pagination && onPageChange && pagination.totalPages > 1 && (
				<Pagination
					pagination={pagination}
					onPageChange={onPageChange}
					onPageSizeChange={() => {}}
					showPageSizeSelector={false}
					showInfo={true}
				/>
			)}

			{selectedRun && (
				<IngestionRunDetailsDrawer
					run={selectedRun}
					open={isDetailsOpen}
					onOpenChange={setIsDetailsOpen}
				/>
			)}
		</>
	);
}
