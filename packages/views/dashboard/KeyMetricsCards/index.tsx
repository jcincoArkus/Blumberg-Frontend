import { t } from "~@/i18n/macro";
import { observer } from "~@/mobx";
import { useKeyMetricsCardsViewModel } from "~@/view-model";

import { MetricCard } from "./MetricCard";
import type { StatusKey } from "./types";

export type { MetricData } from "./types";

export const KeyMetricsCards = observer(function KeyMetricsCards() {
	const vm = useKeyMetricsCardsViewModel();
	const statusLabels: Record<StatusKey, string> = {
		stable: t`Stable`,
		rising: t`Rising`,
		improving: t`Improving`,
	};

	return (
		<div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5">
			<MetricCard label={t`AQI`} metric={vm.aqi} statusLabel={statusLabels[vm.aqi.status]} />
			<MetricCard label={t`CO₂`} metric={vm.co2} statusLabel={statusLabels[vm.co2.status]} />
			<MetricCard
				label={t`Temperature`}
				metric={vm.temperature}
				statusLabel={statusLabels[vm.temperature.status]}
			/>
			<MetricCard
				label={t`Humidity`}
				metric={vm.humidity}
				statusLabel={statusLabels[vm.humidity.status]}
			/>
		</div>
	);
});
