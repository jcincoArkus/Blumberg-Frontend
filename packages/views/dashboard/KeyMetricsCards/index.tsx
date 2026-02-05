import { t } from "~@/i18n/macro";

import { MetricCard } from "./MetricCard";
import type { KeyMetricsCardsProps, StatusKey } from "./types";

export type { KeyMetricsCardsProps, MetricData } from "./types";

export function KeyMetricsCards({ aqi, co2, temperature, humidity }: KeyMetricsCardsProps) {
	const statusLabels: Record<StatusKey, string> = {
		stable: t`Stable`,
		rising: t`Rising`,
		improving: t`Improving`,
	};

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
			<MetricCard label={t`AQI`} metric={aqi} statusLabel={statusLabels[aqi.status]} />
			<MetricCard label={t`CO₂`} metric={co2} statusLabel={statusLabels[co2.status]} />
			<MetricCard
				label={t`Temperature`}
				metric={temperature}
				statusLabel={statusLabels[temperature.status]}
			/>
			<MetricCard
				label={t`Humidity`}
				metric={humidity}
				statusLabel={statusLabels[humidity.status]}
			/>
		</div>
	);
}
