import { Building2, Clock, Server } from "lucide-react";

import { t } from "~@/i18n/macro";
import { Badge, Card, CardContent } from "~@/ui";

type OverviewStatus = "OK" | "Warning" | "Alert";

interface EquipmentOverviewHeaderProps {
	equipmentName: string;
	equipmentId: string;
	equipmentType: string;
	lastUpdate: string;
	siteName?: string;
	siteLocation?: string;
	status: OverviewStatus;
}

const getStatusConfig = () =>
	({
		OK: {
			label: t`OK`,
			className:
				"bg-emerald-100 dark:bg-success-subtle text-emerald-700 dark:text-success-foreground border-emerald-200 dark:border-success-border",
			dot: "bg-success",
		},
		Warning: {
			label: t`Warning`,
			className:
				"bg-amber-100 dark:bg-warning-subtle text-warning-foreground border-warning-border",
			dot: "bg-warning",
		},
		Alert: {
			label: t`Alert`,
			className: "bg-red-100 dark:bg-danger-subtle text-danger-foreground border-danger-border",
			dot: "bg-red-500 dark:bg-danger",
		},
	}) as Record<OverviewStatus, { label: string; className: string; dot: string }>;

function formatLastUpdate(dateStr: string): string {
	const date = new Date(dateStr);
	return date.toLocaleString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

export function EquipmentOverviewHeader({
	equipmentName,
	equipmentId,
	equipmentType,
	lastUpdate,
	siteName,
	siteLocation,
	status,
}: EquipmentOverviewHeaderProps) {
	const config = getStatusConfig()[status];

	return (
		<Card>
			<CardContent className="p-6">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
					<div className="space-y-4 flex-1 min-w-0">
						{/* Equipment Name and Status */}
						<div className="flex flex-wrap items-center gap-4">
							<div className="p-3 rounded-lg bg-primary/10 shrink-0">
								<Server className="size-6 text-primary" aria-hidden="true" />
							</div>
							<div className="flex-1 min-w-0">
								<h1 className="text-2xl font-semibold text-foreground">{equipmentName}</h1>
								<p className="text-xs text-muted-foreground mt-1 break-all font-mono">
									{t`Equipment ID: ${equipmentId}`}
								</p>
							</div>
							<Badge
								variant="outline"
								className={`px-4 py-1.5 text-sm font-medium border-2 ${config.className}`}
							>
								<span className={`size-2 rounded-full mr-2 ${config.dot}`} aria-hidden="true" />
								{config.label}
							</Badge>
						</div>

						{/* Site and Last Updated */}
						<div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
							{siteName && (
								<div className="flex items-center gap-2">
									<Building2 className="size-4" aria-hidden="true" />
									<span className="font-medium text-foreground">{siteName}</span>
									{siteLocation && <span className="text-muted-foreground">({siteLocation})</span>}
								</div>
							)}
							<div className="flex items-center gap-2">
								<Clock className="size-4" aria-hidden="true" />
								<span>{t`Last updated: ${formatLastUpdate(lastUpdate)}`}</span>
							</div>
						</div>
					</div>

					{/* Equipment Type */}
					<div className="sm:text-right sm:ml-6">
						<p className="text-sm text-muted-foreground mb-1">{t`Equipment Type`}</p>
						<p className="font-medium text-foreground">{equipmentType}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
