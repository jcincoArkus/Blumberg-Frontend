import { Database } from "lucide-react";

import { t } from "~@/i18n/macro";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Progress,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "~@/ui";

import type { DataQualitySectionProps } from "./types";

export function DataQualitySection({
	data,
	detail,
	detailLoading = false,
	timeWindow,
	onTimeWindowChange,
}: DataQualitySectionProps) {
	const hasDetailFromApi =
		detail &&
		detail.expectedPoints != null &&
		detail.receivedPoints != null &&
		detail.sensorId === data.sensor.id;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="text-sm font-semibold text-foreground">{t`Data Quality Diagnostics`}</h3>
				<Select
					value={timeWindow}
					onValueChange={(value) => onTimeWindowChange(value as "1h" | "24h" | "7d")}
				>
					<SelectTrigger className="h-8 w-30">
						<SelectValue />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value="1h">{t`Last 1h`}</SelectItem>
						<SelectItem value="24h">{t`Last 24h`}</SelectItem>
						<SelectItem value="7d">{t`Last 7d`}</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{detailLoading ? (
				<Card>
					<CardContent className="py-6">
						<p className="text-sm text-muted-foreground">{t`Loading diagnostics…`}</p>
					</CardContent>
				</Card>
			) : hasDetailFromApi && detail ? (
				<DataQualityFromApiDetail detail={detail} />
			) : data.quality ? (
				<div className="space-y-4">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">{t`Missing Data Summary`}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							<div>
								<div className="flex items-center justify-between mb-1">
									<span className="text-xs text-muted-foreground">{t`Missing Count`}</span>
									<span className="text-sm font-medium">{t`${data.quality.missingPoints} points`}</span>
								</div>
								<div className="flex items-center justify-between mb-1">
									<span className="text-xs text-muted-foreground">{t`Expected`}</span>
									<span className="text-sm font-medium">{t`${data.quality.expectedPoints} points`}</span>
								</div>
								<div className="flex items-center justify-between mb-1">
									<span className="text-xs text-muted-foreground">{t`Received`}</span>
									<span className="text-sm font-medium">{t`${data.quality.receivedPoints} points`}</span>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">{t`Inconsistency Summary`}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-2">
							<div className="flex items-center justify-between">
								<span className="text-xs text-muted-foreground">{t`Inconsistent Points`}</span>
								<span className="text-sm font-medium">{data.quality.inconsistentPoints}</span>
							</div>
							{data.quality.notes && (
								<p className="text-xs text-muted-foreground mt-2">{data.quality.notes}</p>
							)}
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm">{t`Quality Score Indicators`}</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<span className="text-xs font-medium text-foreground">{t`Completeness`}</span>
									<span className="text-xs font-medium text-foreground">
										{data.quality.completenessPct.toFixed(1)}%
									</span>
								</div>
								<Progress value={data.quality.completenessPct} className="h-2" />
							</div>
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<span className="text-xs font-medium text-foreground">{t`Consistency`}</span>
									<span className="text-xs font-medium text-foreground">
										{data.quality.consistencyPct.toFixed(1)}%
									</span>
								</div>
								<Progress value={data.quality.consistencyPct} className="h-2" />
							</div>
							<div>
								<div className="flex items-center justify-between mb-1.5">
									<span className="text-xs font-medium text-foreground">{t`Freshness`}</span>
									<span className="text-xs font-medium text-foreground">
										{data.quality.freshnessPct.toFixed(1)}%
									</span>
								</div>
								<Progress value={data.quality.freshnessPct} className="h-2" />
							</div>
						</CardContent>
					</Card>
				</div>
			) : (
				<Card>
					<CardContent className="py-6 text-center">
						<Database className="size-8 mx-auto mb-2 text-muted-foreground" />
						<p className="text-sm text-muted-foreground">
							{t`No data quality information available for this sensor.`}
						</p>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function DataQualityFromApiDetail({
	detail,
}: {
	detail: { expectedPoints: number | null; receivedPoints: number | null };
}) {
	const expected = detail.expectedPoints ?? 0;
	const received = detail.receivedPoints ?? 0;
	const missing = Math.max(0, expected - received);
	const rawPct = expected > 0 ? (received / expected) * 100 : 100;
	const completenessPct = Math.min(100, rawPct);
	const aboveTarget = rawPct > 100;
	return (
		<Card>
			<CardHeader className="pb-3">
				<CardTitle className="text-sm">{t`Reading counts (last 24h)`}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">{t`Expected`}</span>
					<span className="text-sm font-medium">{expected} points</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">{t`Received`}</span>
					<span className="text-sm font-medium">{received} points</span>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-xs text-muted-foreground">{t`Missing`}</span>
					<span className="text-sm font-medium">{missing} points</span>
				</div>
				<div className="pt-2">
					<div className="flex items-center justify-between mb-1.5">
						<span className="text-xs font-medium text-foreground">{t`Completeness`}</span>
						<span className="text-xs font-medium text-foreground">
							{expected > 0 ? completenessPct.toFixed(1) : "100.0"}%
							{aboveTarget && (
								<span className="ml-1.5 font-normal text-muted-foreground">
									({t`above target`} {rawPct.toFixed(1)}%)
								</span>
							)}
						</span>
					</div>
					<Progress value={completenessPct} className="h-2" />
				</div>
			</CardContent>
		</Card>
	);
}
