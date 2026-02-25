import { KPI_CARDS_CONFIG } from "./constants";
import { KPICard } from "./KPICard";
import type { SensorHealthKPIsProps } from "./types";

export type { SensorHealthKPIsProps } from "./types";

export function SensorHealthKPIs({ kpis }: SensorHealthKPIsProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
			{KPI_CARDS_CONFIG.map((card) => (
				<KPICard
					key={card.key}
					title={card.title}
					value={kpis[card.key]}
					subtitle={card.subtitle?.(kpis)}
					icon={card.icon}
					className={card.className}
					iconClassName={card.iconClassName}
				/>
			))}
		</div>
	);
}
