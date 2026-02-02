import { Eye } from "lucide-react";
import { useState } from "react";

import { t } from "~@/i18n/macro";
import {
	Badge,
	Button,
	cn,
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
}

export function IngestionHistory({ runs }: IngestionHistoryProps) {
	const [selectedRun, setSelectedRun] = useState<IngestionRun | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);

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

	const handleViewDetails = (run: IngestionRun) => {
		setSelectedRun(run);
		setIsDetailsOpen(true);
	};

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
									onClick={() => handleViewDetails(run)}
									className="h-8"
									aria-label={t`View details for run ${run.id}`}
								>
									<Eye className="h-4 w-4" aria-hidden="true" />
								</Button>
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>

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
