import { t } from "~@/i18n/macro";
import { Card, CardContent, CardHeader, CardTitle } from "~@/ui";

import { HealthBadgeWithIcon } from "./HealthBadgeWithIcon";
import { formatTimestampLong } from "./helpers";
import type { SensorHealthSectionProps } from "./types";

export function SensorHealthSection({ data, ageFormatted }: SensorHealthSectionProps) {
	return (
		<div className="space-y-4">
			<h3 className="text-sm font-semibold text-foreground">{t`Sensor Health`}</h3>

			<div className="space-y-3">
				<div className="flex items-center justify-between p-3 rounded-lg border bg-card">
					<div>
						<p className="text-xs text-muted-foreground mb-1">{t`Health Status`}</p>
						<HealthBadgeWithIcon status={data.health?.healthStatus} />
					</div>
				</div>

				{data.health && (
					<>
						<div>
							<p className="text-xs text-muted-foreground mb-1">{t`Last Reported`}</p>
							<p className="text-sm font-medium text-foreground">
								{formatTimestampLong(data.health.lastReportedAt)}
							</p>
							<p className="text-xs text-muted-foreground mt-0.5">
								{data.health.lastReportedAt ? t`${ageFormatted} ago` : t`Never reported`}
							</p>
						</div>

						<div>
							<p className="text-xs text-muted-foreground mb-1">{t`Expected Reporting Interval`}</p>
							<p className="text-sm font-medium text-foreground">
								{t`Every ${Math.floor(data.health.expectedIntervalSeconds / 60)} minutes`}
							</p>
						</div>

						<Card>
							<CardHeader className="pb-3">
								<CardTitle className="text-sm">{t`Classification Logic`}</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-xs">
								<div className="flex items-center justify-between gap-2">
									<span className="text-muted-foreground shrink-0">{t`Healthy:`}</span>
									<span className="font-medium text-right">{t`Fresh + reliability > 90%`}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span className="text-muted-foreground shrink-0">{t`Warning:`}</span>
									<span className="font-medium text-right">{t`Fresh + reliability 70–90%`}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span className="text-muted-foreground shrink-0">{t`Critical:`}</span>
									<span className="font-medium text-right">{t`Fresh + reliability < 70%`}</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span className="text-muted-foreground shrink-0">{t`Stale:`}</span>
									<span className="font-medium text-right">
										{t`Late beyond ${Math.floor(data.health.warningThresholdSeconds / 60)} min (2× expected)`}
									</span>
								</div>
								<div className="flex items-center justify-between gap-2">
									<span className="text-muted-foreground shrink-0">{t`Offline:`}</span>
									<span className="font-medium text-right">
										{t`No report or beyond ${Math.floor(data.health.criticalThresholdSeconds / 60)} min (5× expected)`}
									</span>
								</div>
							</CardContent>
						</Card>
					</>
				)}
			</div>
		</div>
	);
}
